import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  collection, doc, getDocs, getFirestore, limit, onSnapshot, orderBy, query,
  serverTimestamp, addDoc, setDoc, updateDoc, writeBatch, where
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const savedKey = 'yugantar_saved_articles';
const readSaved = () => { try { return JSON.parse(localStorage.getItem(savedKey) || '[]'); } catch { return []; } };
const state = { language: 'EN', category: 'all', search: '', articles: [], saved: readSaved(), poll: null };
let db;
const legacyWireNames = new Set(['NDTV National Feed', 'ABP Ananda Bengali Feed', 'BBC Hindi Feed', 'NYT World Feed', 'NYT Technology Feed', 'NYT Business Feed', 'NYT Sports Feed']);

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};
const youtubeId = value => String(value || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&/]+)/i)?.[1] || '';
const facebookUrl = item => safeUrl(item.embedUrl || item.sourceUrl || item.videoUrl);
const youtubeEmbed = id => id ? `<div class="social-embed"><iframe title="YouTube video" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>` : '';
const facebookEmbed = url => url ? `<div class="social-embed facebook-embed"><div class="fb-post" data-href="${escapeHtml(url)}" data-width="500"></div></div>` : '';
const imageMarkup = (value, alt, fallback = 'YUGANTAR') => {
  const url = safeUrl(value);
  return `<div class="media-frame${url ? '' : ' media-fallback'}">${url ? `<img data-image-fallback loading="lazy" src="${escapeHtml(url)}" alt="${escapeHtml(alt || fallback)}">` : ''}<span class="media-fallback-label">${escapeHtml(fallback)}</span></div>`;
};
const bindImageFallbacks = root => root.querySelectorAll('img[data-image-fallback]').forEach(image => {
  image.addEventListener('error', () => {
    image.closest('.media-frame')?.classList.add('media-failed');
  }, { once: true });
});
const text = (value, language = state.language) => typeof value === 'string' ? value : (value?.[language] || value?.EN || value?.BN || value?.HI || '');
const dateText = value => {
  const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Recently';
};
const setStatus = (element, message, error = false) => { if (element) { element.textContent = message; element.className = `status${error ? ' error' : ''}`; } };
const isSaved = id => state.saved.some(article => article.id === id);

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀' : '☾';
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
  try { localStorage.setItem('yugantar_theme', theme); } catch {}
}

function toggleSaved(id) {
  const article = state.articles.find(item => item.id === id) || state.saved.find(item => item.id === id);
  if (!article) return;
  state.saved = isSaved(id) ? state.saved.filter(item => item.id !== id) : [article, ...state.saved].slice(0, 50);
  try { localStorage.setItem(savedKey, JSON.stringify(state.saved)); } catch {}
  renderArticles(); renderSaved();
  const dialogButton = [...document.querySelectorAll('[data-dialog-save]')].find(button => button.dataset.dialogSave === id);
  if (dialogButton) dialogButton.textContent = isSaved(id) ? '★ Saved' : '☆ Save article';
}

function renderSaved() {
  const count = $('saved-count');
  if (count) count.textContent = String(state.saved.length);
  const target = $('saved-list');
  if (!target) return;
  if (!state.saved.length) { target.innerHTML = '<div class="empty-state">Your saved reading list is empty.</div>'; return; }
  target.innerHTML = state.saved.map(article => `<div class="saved-item"><button class="saved-open" data-open-saved="${escapeHtml(article.id)}" type="button"><strong>${escapeHtml(text(article.title))}</strong><small>${escapeHtml(article.sourceAgency || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></button><button class="saved-remove" data-remove-saved="${escapeHtml(article.id)}" type="button" aria-label="Remove saved article">×</button></div>`).join('');
  target.querySelectorAll('[data-open-saved]').forEach(button => button.addEventListener('click', () => { $('saved-dialog').close(); openArticle(button.dataset.openSaved); }));
  target.querySelectorAll('[data-remove-saved]').forEach(button => button.addEventListener('click', () => {
    state.saved = state.saved.filter(item => item.id !== button.dataset.removeSaved);
    try { localStorage.setItem(savedKey, JSON.stringify(state.saved)); } catch {}
    renderArticles(); renderSaved();
  }));
}

function showSetupMessage() {
  const message = 'Firebase is not configured. Add the client configuration in firebase-config.js before deployment.';
  ['setup-banner', 'admin-setup'].forEach(id => {
    const element = $(id);
    if (element) { element.textContent = message; element.classList.remove('hidden'); }
  });
}

function updateClock() {
  const target = $('current-date');
  if (target) target.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function renderArticles() {
  const target = $('articles');
  const term = state.search.trim().toLowerCase();
  const articles = state.articles.filter(article => !legacyWireNames.has(article.sourceAgency) && article.sourceType !== 'wire').filter(article => {
    const categoryMatch = state.category === 'all' || article.category === state.category;
    const searchable = `${text(article.title)} ${text(article.summary)} ${article.author || ''} ${article.sourceAgency || ''}`.toLowerCase();
    return categoryMatch && (!term || searchable.includes(term));
  });
  if (!articles.length) { target.innerHTML = '<div class="empty-state">No published stories match this view.</div>'; return; }
  target.innerHTML = articles.map(article => `<article class="article-card" data-article-id="${escapeHtml(article.id)}">
    ${imageMarkup(article.image, text(article.title), 'YUGANTAR')}
    <div class="article-body"><span class="tag">${escapeHtml(article.category || 'NEWS')}</span><h3>${escapeHtml(text(article.title))}</h3><p>${escapeHtml(text(article.summary))}</p><small>${escapeHtml(article.sourceAgency || article.author || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></div>
    <button class="save-article" data-save-id="${escapeHtml(article.id)}" type="button" aria-label="${isSaved(article.id) ? 'Remove from saved articles' : 'Save article'}" title="${isSaved(article.id) ? 'Remove from saved articles' : 'Save article'}">${isSaved(article.id) ? '★' : '☆'}</button>
  </article>`).join('');
  target.querySelectorAll('[data-article-id]').forEach(card => card.addEventListener('click', () => openArticle(card.dataset.articleId)));
  target.querySelectorAll('[data-save-id]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); toggleSaved(button.dataset.saveId); }));
  bindImageFallbacks(target);
}

function openArticle(id) {
  const article = state.articles.find(item => item.id === id) || state.saved.find(item => item.id === id);
  if (!article) return;
  const sourceUrl = safeUrl(article.sourceUrl);
  $('article-detail').innerHTML = `<span class="tag">${escapeHtml(article.category || 'NEWS')}</span><h1>${escapeHtml(text(article.title))}</h1><p class="muted">${escapeHtml(article.author || 'YUGANTAR Editorial')} · ${escapeHtml(dateText(article.publishedAt))}</p>${imageMarkup(article.image, text(article.title), 'YUGANTAR')}<div class="article-actions"><button class="button" data-dialog-save="${escapeHtml(article.id)}" type="button">${isSaved(article.id) ? '★ Saved' : '☆ Save article'}</button>${sourceUrl ? `<a class="button button-outline" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">View original source</a>` : ''}</div><p class="lead">${escapeHtml(text(article.summary))}</p><div class="article-copy">${escapeHtml(text(article.content) || text(article.summary)).replace(/\n/g, '<br>')}</div>`;
  $('article-detail').querySelector('[data-dialog-save]')?.addEventListener('click', () => toggleSaved(article.id));
  bindImageFallbacks($('article-detail'));
  $('article-dialog').showModal();
}

function renderHero() {
  const hero = state.articles.find(article => article.hero) || state.articles[0];
  const target = $('hero-card');
  if (!hero) { target.className = 'hero-card empty-state'; target.textContent = 'No featured story has been published yet.'; return; }
  target.className = 'hero-card';
  target.innerHTML = `${imageMarkup(hero.image, text(hero.title), 'FEATURED')}<div class="hero-copy"><span class="tag">${escapeHtml(hero.breaking ? 'BREAKING' : 'FEATURED')}</span><h1>${escapeHtml(text(hero.title))}</h1><p>${escapeHtml(text(hero.summary))}</p><button class="button" data-hero-id="${escapeHtml(hero.id)}">Read full story</button></div>`;
  target.querySelector('[data-hero-id]')?.addEventListener('click', () => openArticle(hero.id));
  bindImageFallbacks(target);
}

function renderHeadlineStrip() {
  const target = $('headline-strip');
  if (!target) return;
  const items = state.articles.slice(0, 5);
  target.innerHTML = items.length ? items.map((article, index) => `<button class="headline-item" data-headline-id="${escapeHtml(article.id)}" type="button"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(text(article.title))}</strong></button>`).join('') : '<span class="muted">No newsroom developments yet.</span>';
  target.querySelectorAll('[data-headline-id]').forEach(button => button.addEventListener('click', () => openArticle(button.dataset.headlineId)));
}

function renderVideos(snapshot) {
  const videos = snapshot.map(item => {
    const id = youtubeId(item.videoUrl || item.embedUrl);
    const thumbnail = item.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');
    const videoUrl = safeUrl(item.videoUrl || item.sourceUrl);
    const embed = item.provider === 'youtube' ? youtubeEmbed(id) : item.provider === 'facebook' ? facebookEmbed(facebookUrl(item)) : '';
    const media = embed || imageMarkup(thumbnail, item.title, item.mediaType === 'photo' ? 'PHOTO' : 'SOCIAL');
    return `<article class="video-card social-card">${media}<div><span class="tag">${escapeHtml(item.provider || 'SOCIAL')} · ${escapeHtml(item.mediaType || 'POST')}</span><h3>${escapeHtml(item.title || 'Untitled post')}</h3><p class="social-description">${escapeHtml(item.description || 'Official post from the client channel.')}</p><small>${escapeHtml(dateText(item.publishedAt))}</small><div class="social-actions">${videoUrl ? `<a class="button button-outline" href="${escapeHtml(videoUrl)}" target="_blank" rel="noreferrer">View original</a>` : ''}</div></div></article>`;
  });
  $('videos').innerHTML = videos.length ? videos.join('') : '<div class="empty-state">No channel videos have been synchronized yet.</div>';
  bindImageFallbacks($('videos'));
  if (window.FB) window.FB.XFBML.parse($('videos'));
}

function renderPoll(poll) {
  state.poll = poll;
  if (!poll) { $('poll-question').textContent = 'No active poll'; $('poll-options').innerHTML = ''; return; }
  $('poll-question').textContent = text(poll.question);
  const counts = { ...Object.fromEntries((poll.options || []).map(option => [option.optionId, 0])), ...(poll.voteCounts || {}) }; poll.voteCounts = counts; const total = Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0); const selected = poll.userOption || '';
  $('poll-options').innerHTML = (poll.options || []).map(option => { const count = Number(counts[option.optionId] || 0); const percentage = total ? Math.round((count / total) * 100) : 0; return `<button class="poll-option${selected === option.optionId ? ' selected' : ''}" data-option-id="${escapeHtml(option.optionId)}" type="button"><span class="poll-option-row"><strong>${escapeHtml(text(option.text))}</strong><span>${percentage}%</span></span><span class="poll-result-track"><span style="width:${percentage}%"></span></span></button>`; }).join('');
  $('poll-options').querySelectorAll('[data-option-id]').forEach(button => button.addEventListener('click', () => votePoll(button.dataset.optionId)));
}

async function votePoll(optionId) {
  if (!state.poll) return;
  setStatus($('poll-status'), 'Submitting vote…');
  try {
    const anonymous = await signInAnonymously(getAuth());
    const pollRef = doc(db, 'polls', state.poll.id); const counts = { ...(state.poll.voteCounts || {}) }; counts[optionId] = Number(counts[optionId] || 0) + 1;
    const batch = writeBatch(db); batch.set(doc(db, 'polls', state.poll.id, 'votes', anonymous.user.uid), { uid: anonymous.user.uid, optionId, createdAt: serverTimestamp() }); batch.update(pollRef, { voteCounts: counts, updatedAt: serverTimestamp() }); await batch.commit();
    state.poll.voteCounts = counts; state.poll.userOption = optionId; renderPoll(state.poll); setStatus($('poll-status'), 'Vote recorded. Your selection is highlighted.');
  } catch (error) {
    if (error.code === 'already-exists' || error.code === 'permission-denied') setStatus($('poll-status'), 'This identity has already voted, or the poll is no longer active.', true);
    else setStatus($('poll-status'), 'Voting is temporarily unavailable.', true);
  }
}

async function loadArticles() {
  try {
    const result = await getDocs(query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(50)));
    state.articles = result.docs.map(item => ({ id: item.id, ...item.data() }));
    renderArticles(); renderHero(); renderHeadlineStrip();
  } catch (error) {
    console.error('Articles query failed:', error);
    $('articles').innerHTML = '<div class="empty-state">Articles could not be loaded. Check Firestore rules and indexes.</div>';
  }
}

function startRealtimeListeners() {
  onSnapshot(query(collection(db, 'tickers'), where('active', '==', true), orderBy('priority', 'asc'), limit(20)), snapshot => {
    const items = snapshot.docs.map(item => item.data());
    $('ticker-items').innerHTML = items.length ? items.map(item => `<span>${escapeHtml(text(item.title))}</span>`).join(' <b>•</b> ') : 'No active breaking updates.';
  }, () => { $('ticker-items').textContent = 'Breaking updates are temporarily unavailable.'; });
  onSnapshot(query(collection(db, 'liveStreams'), where('active', '==', true), limit(1)), snapshot => {
    const stream = snapshot.docs[0]?.data();
    $('live-title').textContent = stream?.title || 'Live channel';
    $('live-meta').textContent = stream?.provider ? `${stream.provider} · Updated ${dateText(stream.updatedAt)}` : 'No live stream configured.';
    const youtubeVideoId = youtubeId(stream?.videoUrl);
    const streamUrl = safeUrl(stream?.videoUrl);
    $('live-player').innerHTML = youtubeVideoId ? youtubeEmbed(youtubeVideoId) : (stream?.provider === 'facebook' && streamUrl ? facebookEmbed(streamUrl) : (streamUrl ? `<a class="button" href="${escapeHtml(streamUrl)}" target="_blank" rel="noreferrer">Open live stream</a>` : 'No live stream configured.'));
    if (window.FB) window.FB.XFBML.parse($('live-player'));
    const action = $('live-action');
    if (action && streamUrl) { action.href = streamUrl; action.classList.remove('hidden'); } else if (action) action.classList.add('hidden');
  });
}

async function loadVideosAndPoll() {
  const videos = await getDocs(query(collection(db, 'videoItems'), where('active', '==', true), orderBy('publishedAt', 'desc'), limit(8))).catch(() => ({ docs: [] }));
  renderVideos(videos.docs.map(item => item.data()));
  const polls = await getDocs(query(collection(db, 'polls'), where('active', '==', true), limit(1))).catch(() => ({ docs: [] }));
  renderPoll(polls.docs[0] ? { id: polls.docs[0].id, ...polls.docs[0].data() } : null);
}

async function subscribe(event) {
  event.preventDefault();
  const email = $('newsletter-email').value.trim().toLowerCase();
  try {
    await addDoc(collection(db, 'subscribers'), { email, active: true, createdAt: serverTimestamp() });
    $('newsletter-form').reset(); setStatus($('newsletter-status'), 'Thank you. Please check your email if verification is enabled.');
  } catch (error) { setStatus($('newsletter-status'), 'Subscription is temporarily unavailable.', true); }
}

function bindUi() {
  const storedTheme = (() => { try { return localStorage.getItem('yugantar_theme'); } catch { return null; } })();
  setTheme(storedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('saved-toggle').addEventListener('click', () => $('saved-dialog').showModal());
  $('close-saved').addEventListener('click', () => $('saved-dialog').close());
  renderSaved();
  $('language').addEventListener('change', event => { state.language = event.target.value; renderArticles(); renderHero(); renderHeadlineStrip(); renderSaved(); if (state.poll) renderPoll(state.poll); });
  $('search').addEventListener('input', event => { state.search = event.target.value; renderArticles(); });
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { state.category = button.dataset.category; document.querySelectorAll('.category').forEach(item => item.classList.toggle('active', item === button)); renderArticles(); }));
  document.querySelectorAll('[data-footer-category]').forEach(link => link.addEventListener('click', () => {
    state.category = link.dataset.footerCategory;
    document.querySelectorAll('.category').forEach(item => item.classList.toggle('active', item.dataset.category === state.category));
    renderArticles();
  }));
  $('newsletter-form').addEventListener('submit', subscribe);
  $('close-dialog').addEventListener('click', () => $('article-dialog').close());
}

bindUi();
updateClock();
setInterval(updateClock, 60000);
if (!firebaseConfigured) showSetupMessage();
else {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  $('sync-status').textContent = 'LIVE DATA';
  startRealtimeListeners(); loadArticles(); loadVideosAndPoll();
}
