import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const status = (id, message, error = false) => { const node = $(id); if (node) { node.textContent = message; node.className = `status${error ? ' error' : ''}`; } };
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const languageObject = (en, bn, hi) => ({ EN: en.trim(), BN: bn.trim(), HI: hi.trim() });
const displayText = value => typeof value === 'string' ? value : (value?.EN || value?.BN || value?.HI || 'Untitled');
const dateText = value => { const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null); return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Recently'; };
const readUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
let db;
let editingArticleId = '';
let currentRole = '';
let articleCache = [];
let videoCache = [];
let hiddenVideoCache = [];
let tickerCache = [];
let pollCache = [];
let pollVoteCounts = new Map();
let activeAuth;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = $('admin-theme-toggle');
  if (button) { button.textContent = theme === 'dark' ? '☀' : '☾'; button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); }
  try { localStorage.setItem('yugantar_theme', theme); } catch {}
}

function bindTheme() {
  let saved = null; try { saved = localStorage.getItem('yugantar_theme'); } catch {}
  setTheme(saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('admin-theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

async function roleFor(user) { const profile = await getDoc(doc(db, 'users', user.uid)); return profile.exists() ? profile.data().role : ''; }

function articlePayload(auth) {
  const requestedStatus = $('article-status-select').value;
  const articleStatus = currentRole === 'reporter' ? 'draft' : requestedStatus;
  return {
    title: languageObject($('article-title-en').value, $('article-title-bn').value, $('article-title-hi').value),
    summary: languageObject($('article-summary-en').value, '', ''), content: languageObject($('article-content-en').value, '', ''),
    category: $('article-category').value, author: $('article-author').value.trim(), sourceAgency: $('article-source-agency').value.trim(), sourceUrl: readUrl($('article-source-url').value), image: readUrl($('article-image').value), sourceLanguage: 'EN', status: articleStatus, hero: $('article-hero').checked, trending: false, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid
  };
}

function resetArticleForm() {
  editingArticleId = ''; $('article-form').reset(); $('article-author').value = 'YUGANTAR Editorial'; $('article-source-agency').value = 'YUGANTAR'; $('article-status-select').value = currentRole === 'reporter' ? 'draft' : 'published'; $('article-submit').textContent = 'Publish article'; $('article-reset').classList.add('hidden'); $('article-image-preview').textContent = 'Cover preview appears here';
}

function updateImagePreview() {
  const url = readUrl($('article-image').value); const preview = $('article-image-preview');
  preview.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Cover preview" onerror="this.parentElement.textContent='This image URL could not be loaded.'">` : 'Cover preview appears here';
}

function renderArticleList() {
  const target = $('article-list');
  if (!articleCache.length) { target.innerHTML = '<div class="empty-state">No articles found.</div>'; return; }
  target.innerHTML = articleCache.map(article => `<div class="admin-list-item"><div><strong>${escapeHtml(displayText(article.title))}</strong><small><span class="status-chip ${escapeHtml(article.status || 'draft')}">${escapeHtml(article.status || 'draft')}</span> ${escapeHtml(article.category || 'news')} · ${escapeHtml(dateText(article.updatedAt || article.publishedAt))}</small></div><div class="item-actions"><button class="text-button" type="button" data-edit-article="${escapeHtml(article.id)}">Edit</button>${currentRole !== 'reporter' ? `<button class="text-button danger" type="button" data-delete-article="${escapeHtml(article.id)}">Delete</button>` : ''}</div></div>`).join('');
  target.querySelectorAll('[data-edit-article]').forEach(button => button.addEventListener('click', () => editArticle(button.dataset.editArticle)));
  target.querySelectorAll('[data-delete-article]').forEach(button => button.addEventListener('click', () => deleteArticle(button.dataset.deleteArticle)));
}

function renderSimpleList(targetId, items, type) {
  const target = $(targetId);
  if (!items.length) { target.innerHTML = '<div class="empty-state">No items found.</div>'; return; }
  target.innerHTML = items.map(item => {
    const label = type === 'ticker' ? displayText(item.title) : item.title || 'Untitled';
    const actions = type === 'video'
      ? `<button class="text-button" type="button" data-edit-video="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-hide-video="${escapeHtml(item.id)}">Hide</button>`
      : `<button class="text-button" type="button" data-edit-ticker="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-delete-ticker="${escapeHtml(item.id)}">Delete</button>`;
    return `<div class="admin-list-item"><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(item.provider || item.category || 'YUGANTAR')} · ${escapeHtml(dateText(item.updatedAt || item.publishedAt))}</small></div><div class="item-actions">${actions}</div></div>`;
  }).join('');
  target.querySelectorAll('[data-edit-video]').forEach(button => button.addEventListener('click', () => editVideo(button.dataset.editVideo)));
  target.querySelectorAll('[data-hide-video]').forEach(button => button.addEventListener('click', () => hideVideo(button.dataset.hideVideo)));
  target.querySelectorAll('[data-edit-ticker]').forEach(button => button.addEventListener('click', () => editTicker(button.dataset.editTicker)));
  target.querySelectorAll('[data-delete-ticker]').forEach(button => button.addEventListener('click', () => deleteTicker(button.dataset.deleteTicker)));
}

async function loadAdminData() {
  status('admin-data-status', 'Refreshing newsroom data…');
  try {
    const [articlesSnapshot, tickersSnapshot, videosSnapshot, controlsSnapshot] = await Promise.all([getDocs(collection(db, 'articles')), getDocs(collection(db, 'tickers')), getDocs(collection(db, 'videoItems')), getDocs(collection(db, 'videoControls'))]);
    articleCache = articlesSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    const hiddenIds = new Set(controlsSnapshot.docs.filter(item => item.data().hidden === true).map(item => item.id));
    const allVideos = videosSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    videoCache = allVideos.filter(item => item.active !== false && !hiddenIds.has(item.id)).sort((a, b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0));
    hiddenVideoCache = allVideos.filter(item => item.active === false || hiddenIds.has(item.id)).sort((a, b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0));
    const tickers = tickerCache = tickersSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => item.active !== false);
    tickerCache.sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
    $('stat-articles').textContent = articleCache.filter(item => item.status === 'published').length;
    $('stat-drafts').textContent = articleCache.filter(item => item.status === 'draft').length;
    $('stat-videos').textContent = videoCache.length;
    $('stat-tickers').textContent = tickerCache.length;
    const pollSnapshot = await getDocs(collection(db, 'polls'));
    pollVoteCounts = new Map();
    pollCache = await Promise.all(pollSnapshot.docs.map(async item => { const votes = await getDocs(collection(db, 'polls', item.id, 'votes')).catch(() => ({ size: 0 })); pollVoteCounts.set(item.id, votes.size || 0); return { id: item.id, ...item.data() }; }));
    pollCache.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    renderArticleList(); renderSimpleList('video-list', videoCache, 'video'); renderHiddenVideos(); renderSimpleList('ticker-list', tickerCache, 'ticker'); renderPollList();
    $('last-refresh').textContent = `Updated ${new Date().toLocaleTimeString()}`; status('admin-data-status', 'Data refreshed.');
  } catch (error) { console.error('Admin data load failed:', error); status('admin-data-status', 'Could not load editorial data. Check Firestore rules.', true); }
}

function editArticle(id) {
  const article = articleCache.find(item => item.id === id); if (!article) return;
  const title = article.title || {}; const summary = article.summary || {}; const content = article.content || {};
  editingArticleId = id; $('article-title-en').value = title.EN || ''; $('article-title-bn').value = title.BN || ''; $('article-title-hi').value = title.HI || ''; $('article-summary-en').value = summary.EN || ''; $('article-content-en').value = content.EN || '';
  $('article-category').value = article.category || 'national'; $('article-author').value = article.author || ''; $('article-source-agency').value = article.sourceAgency || 'YUGANTAR'; $('article-image').value = article.image || ''; $('article-source-url').value = article.sourceUrl || ''; $('article-hero').checked = Boolean(article.hero); $('article-status-select').value = article.status || 'draft'; $('article-submit').textContent = 'Save article changes'; $('article-reset').classList.remove('hidden'); updateImagePreview();
  document.querySelector('[data-admin-tab="publish"]')?.click(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteArticle(id) {
  const article = articleCache.find(item => item.id === id); if (!article || !window.confirm(`Delete “${displayText(article.title)}”?`)) return;
  try { await deleteDoc(doc(db, 'articles', id)); status('admin-data-status', 'Article deleted.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

function resetVideoForm() {
  $('video-form').reset(); delete $('video-form').dataset.editingId; $('video-submit').textContent = 'Publish social item'; $('video-reset').classList.add('hidden'); $('video-provider').value = 'youtube';
}

function editVideo(id) {
  const item = videoCache.find(video => video.id === id); if (!item) return;
  $('video-title').value = item.title || ''; $('video-provider').value = item.provider || 'youtube'; $('video-url').value = item.videoUrl || item.sourceUrl || ''; $('video-description').value = item.description || ''; $('video-thumbnail').value = item.thumbnail || '';
  $('video-form').dataset.editingId = id; $('video-submit').textContent = 'Save video changes'; $('video-reset').classList.remove('hidden'); document.querySelector('[data-admin-tab="live"]')?.click(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHiddenVideos() {
  const target = $('hidden-video-list');
  if (!hiddenVideoCache.length) { target.innerHTML = '<div class="empty-state">No hidden videos.</div>'; return; }
  target.innerHTML = hiddenVideoCache.map(item => `<div class="admin-list-item"><div><strong>${escapeHtml(item.title || 'Untitled')}</strong><small>${escapeHtml(item.provider || 'youtube')} · hidden from public view</small></div><div class="item-actions"><button class="text-button" type="button" data-restore-video="${escapeHtml(item.id)}">Restore</button><button class="text-button danger" type="button" data-purge-video="${escapeHtml(item.id)}">Delete permanently</button></div></div>`).join('');
  target.querySelectorAll('[data-restore-video]').forEach(button => button.addEventListener('click', () => restoreVideo(button.dataset.restoreVideo)));
  target.querySelectorAll('[data-purge-video]').forEach(button => button.addEventListener('click', () => purgeVideo(button.dataset.purgeVideo)));
}

function pollText(value) { return typeof value === 'string' ? value : (value?.EN || value?.BN || value?.HI || 'Untitled poll'); }

function renderPollList() {
  const target = $('poll-list');
  if (!pollCache.length) { target.innerHTML = '<div class="empty-state">No polls created.</div>'; return; }
  target.innerHTML = pollCache.map(poll => `<div class="admin-list-item"><div><strong>${escapeHtml(pollText(poll.question))}</strong><small><span class="status-chip ${poll.active ? 'published' : 'draft'}">${poll.active ? 'active' : 'inactive'}</span> · ${pollVoteCounts.get(poll.id) || 0} votes</small></div><div class="item-actions"><button class="text-button" type="button" data-edit-poll="${escapeHtml(poll.id)}">Edit</button><button class="text-button danger" type="button" data-delete-poll="${escapeHtml(poll.id)}">Delete</button></div></div>`).join('');
  target.querySelectorAll('[data-edit-poll]').forEach(button => button.addEventListener('click', () => editPoll(button.dataset.editPoll)));
  target.querySelectorAll('[data-delete-poll]').forEach(button => button.addEventListener('click', () => deletePoll(button.dataset.deletePoll)));
}

async function hideVideo(id) {
  const item = videoCache.find(video => video.id === id); if (!item) return;
  if (!window.confirm(`Hide “${item.title || 'this video'}” from the public site? You can restore it later.`)) return;
  try { await setDoc(doc(db, 'videoControls', id), { hidden: true, hiddenAt: serverTimestamp(), hiddenBy: activeAuth.currentUser.uid, reason: 'Removed by editor' }); await updateDoc(doc(db, 'videoItems', id), { active: false, hidden: true, updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid }); status('admin-data-status', 'Video hidden.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

async function restoreVideo(id) {
  const item = hiddenVideoCache.find(video => video.id === id); if (!item) return;
  try { await setDoc(doc(db, 'videoControls', id), { hidden: false, restoredAt: serverTimestamp(), restoredBy: activeAuth.currentUser.uid }); await updateDoc(doc(db, 'videoItems', id), { active: true, hidden: false, updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid }); status('admin-data-status', 'Video restored.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

async function purgeVideo(id) {
  const item = hiddenVideoCache.find(video => video.id === id); if (!item || !window.confirm(`Permanently delete “${item.title || 'this video'}”? This cannot be undone.`)) return;
  try { await deleteDoc(doc(db, 'videoItems', id)); await deleteDoc(doc(db, 'videoControls', id)); status('admin-data-status', 'Video permanently deleted.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

function resetTickerForm() {
  $('ticker-form').reset(); delete $('ticker-form').dataset.editingId; $('ticker-category').value = 'BREAKING'; $('ticker-priority').value = '1'; $('ticker-submit').textContent = 'Publish ticker'; $('ticker-reset').classList.add('hidden');
}

function editTicker(id) {
  const item = tickerCache.find(ticker => ticker.id === id); if (!item) return;
  const title = item.title || {}; $('ticker-en').value = title.EN || ''; $('ticker-bn').value = title.BN || ''; $('ticker-hi').value = title.HI || ''; $('ticker-category').value = item.category || 'BREAKING'; $('ticker-priority').value = item.priority ?? 1;
  $('ticker-form').dataset.editingId = id; $('ticker-submit').textContent = 'Save ticker changes'; $('ticker-reset').classList.remove('hidden'); document.querySelector('[data-admin-tab="live"]')?.click(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteTicker(id) {
  const item = tickerCache.find(ticker => ticker.id === id); if (!item) return;
  if (!window.confirm(`Delete ticker “${displayText(item.title)}”? This cannot be undone.`)) return;
  try { await deleteDoc(doc(db, 'tickers', id)); status('admin-data-status', 'Ticker deleted.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

function pollPayload() {
  const fieldValue = id => $(id)?.value || '';
  const options = [1, 2, 3, 4].map(index => ({ optionId: `option-${index}`, text: languageObject(fieldValue(`poll-option-${index}-en`), fieldValue(`poll-option-${index}-bn`), fieldValue(`poll-option-${index}-hi`)) })).filter(option => option.text.EN || option.text.BN || option.text.HI);
  if (options.length < 2) throw new Error('A poll needs at least two options.');
  const voteCounts = Object.fromEntries([1, 2, 3, 4].map(index => [`option-${index}`, 0]));
  return { question: languageObject($('poll-question-en').value, $('poll-question-bn').value, $('poll-question-hi').value), options, voteCounts, active: $('poll-active').checked, updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid };
}

function resetPollForm() {
  $('poll-form').reset(); delete $('poll-form').dataset.editingId; $('poll-active').checked = true; $('poll-submit').textContent = 'Create poll'; $('poll-reset').classList.add('hidden');
}

function editPoll(id) {
  const poll = pollCache.find(item => item.id === id); if (!poll) return;
  const question = poll.question || {}; $('poll-question-en').value = question.EN || ''; $('poll-question-bn').value = question.BN || ''; $('poll-question-hi').value = question.HI || '';
  [1, 2, 3, 4].forEach(index => { const option = poll.options?.find(item => item.optionId === `option-${index}`) || poll.options?.[index - 1] || {}; const textValue = option.text || {}; if ($(`poll-option-${index}-en`)) $(`poll-option-${index}-en`).value = textValue.EN || ''; if ($(`poll-option-${index}-bn`)) $(`poll-option-${index}-bn`).value = textValue.BN || ''; if ($(`poll-option-${index}-hi`)) $(`poll-option-${index}-hi`).value = textValue.HI || ''; });
  $('poll-active').checked = poll.active === true; $('poll-form').dataset.editingId = id; $('poll-submit').textContent = 'Save poll changes'; $('poll-reset').classList.remove('hidden'); document.querySelector('[data-admin-tab="poll"]')?.click(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deactivateOtherPolls(exceptId = '') {
  await Promise.all(pollCache.filter(poll => poll.id !== exceptId && poll.active).map(poll => updateDoc(doc(db, 'polls', poll.id), { active: false, updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid })));
}

async function deletePoll(id) {
  const poll = pollCache.find(item => item.id === id); if (!poll || !window.confirm(`Delete poll “${pollText(poll.question)}” and all its votes? This cannot be undone.`)) return;
  try { const votes = await getDocs(collection(db, 'polls', id, 'votes')); await Promise.all(votes.docs.map(vote => deleteDoc(vote.ref))); await deleteDoc(doc(db, 'polls', id)); status('admin-data-status', 'Poll deleted.'); await loadAdminData(); } catch (error) { status('admin-data-status', error.message, true); }
}

function bindForms(auth) {
  activeAuth = auth;
  $('logout').onclick = () => signOut(auth); $('refresh-admin').onclick = loadAdminData; $('article-image').addEventListener('input', updateImagePreview); $('article-reset').onclick = resetArticleForm; $('video-reset').onclick = resetVideoForm; $('ticker-reset').onclick = resetTickerForm; $('poll-reset').onclick = resetPollForm;
  document.querySelectorAll('[data-admin-tab]').forEach(button => button.addEventListener('click', () => { const name = button.dataset.adminTab; document.querySelectorAll('[data-admin-tab]').forEach(item => item.classList.toggle('active', item === button)); document.querySelectorAll('[data-admin-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.adminPanel === name)); }));
  $('article-form').onsubmit = async event => { event.preventDefault(); try { const data = articlePayload(auth); if (editingArticleId) { await updateDoc(doc(db, 'articles', editingArticleId), data); status('article-status', 'Article changes saved.'); } else { await addDoc(collection(db, 'articles'), { ...data, createdBy: auth.currentUser.uid, publishedAt: serverTimestamp() }); status('article-status', data.status === 'draft' ? 'Draft saved.' : 'Article published.'); } resetArticleForm(); await loadAdminData(); } catch (error) { status('article-status', error.message, true); } };
  $('poll-form').onsubmit = async event => { event.preventDefault(); try { const id = $('poll-form').dataset.editingId || ''; const data = pollPayload(); if (id) { const existing = pollCache.find(poll => poll.id === id); data.voteCounts = existing?.voteCounts || data.voteCounts; } if (data.active) await deactivateOtherPolls(id); if (id) { await updateDoc(doc(db, 'polls', id), data); status('poll-status', 'Poll changes saved.'); } else { await addDoc(collection(db, 'polls'), { ...data, createdAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('poll-status', 'Poll published.'); } resetPollForm(); await loadAdminData(); } catch (error) { status('poll-status', error.message, true); } };
  $('ticker-form').onsubmit = async event => { event.preventDefault(); try { const id = $('ticker-form').dataset.editingId; const data = { title: languageObject($('ticker-en')?.value || '', $('ticker-bn')?.value || '', $('ticker-hi')?.value || ''), category: $('ticker-category')?.value.trim().toUpperCase() || 'BREAKING', priority: Number($('ticker-priority')?.value) || 1, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }; if (id) { await updateDoc(doc(db, 'tickers', id), data); status('ticker-status', 'Ticker changes saved.'); } else { await addDoc(collection(db, 'tickers'), { ...data, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('ticker-status', 'Ticker is live.'); } resetTickerForm(); await loadAdminData(); } catch (error) { status('ticker-status', error.message, true); } };
  $('stream-form').onsubmit = async event => { event.preventDefault(); try { await setDoc(doc(db, 'liveStreams', 'primary'), { title: $('stream-title').value.trim(), provider: $('stream-provider').value, videoUrl: readUrl($('stream-url').value), isLive: $('stream-live').checked, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }); status('stream-status', 'Live stream saved.'); $('stream-delete').classList.remove('hidden'); } catch (error) { status('stream-status', error.message, true); } };
  $('stream-delete').onclick = async () => { if (!window.confirm('Delete the live stream? This cannot be undone.')) return; try { await deleteDoc(doc(db, 'liveStreams', 'primary')); $('stream-form').reset(); $('stream-delete').classList.add('hidden'); status('stream-status', 'Live stream deleted.'); } catch (error) { status('stream-status', error.message, true); } };
  $('video-form').onsubmit = async event => { event.preventDefault(); try { const id = $('video-form').dataset.editingId; const url = readUrl($('video-url').value); const provider = $('video-provider').value; const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&/]+)/i); const data = { title: $('video-title').value.trim(), description: $('video-description').value.trim(), provider, mediaType: provider === 'youtube' ? 'video' : 'post', videoUrl: url, embedUrl: provider === 'youtube' && match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url, thumbnail: readUrl($('video-thumbnail').value), sourceUrl: url, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }; if (id) { await updateDoc(doc(db, 'videoItems', id), data); status('video-status', 'Video changes saved.'); } else { await addDoc(collection(db, 'videoItems'), { ...data, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('video-status', 'Social item published.'); } resetVideoForm(); await loadAdminData(); } catch (error) { status('video-status', error.message, true); } };
  $('source-form').onsubmit = async event => { event.preventDefault(); try { await setDoc(doc(db, 'externalSources', `${$('source-provider').value}-${$('source-id').value.trim()}`), { provider: $('source-provider').value, name: $('source-name').value.trim(), channelOrPageId: $('source-id').value.trim(), liveUrl: readUrl($('source-live-url').value), active: true, updatedAt: serverTimestamp() }); $('source-form').reset(); status('source-status', 'Source saved. Keep tokens in the private worker config.'); } catch (error) { status('source-status', error.message, true); } };
  if (currentRole === 'reporter') { $('article-status-select').value = 'draft'; $('article-status-select').disabled = true; }
}

bindTheme();
if (!firebaseConfigured) { $('admin-setup').textContent = 'Firebase is not configured. Add the client configuration in firebase-config.js before deployment.'; $('admin-setup').classList.remove('hidden'); }
else {
  const app = initializeApp(firebaseConfig); const auth = getAuth(app); db = getFirestore(app);
  $('login-form').onsubmit = async event => { event.preventDefault(); try { status('login-status', 'Signing in…'); await signInWithEmailAndPassword(auth, $('login-email').value.trim(), $('login-password').value); } catch (error) { console.error('Firebase admin login failed:', error); const messages = { 'auth/invalid-credential': 'Email or password is incorrect.', 'auth/user-not-found': 'No Firebase Authentication user exists for this email.', 'auth/wrong-password': 'The password is incorrect.', 'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Authentication.', 'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication settings.' }; status('login-status', messages[error.code] || error.message || 'Firebase sign-in failed.', true); } };
  onAuthStateChanged(auth, async user => { if (!user) { $('login-panel').classList.remove('hidden'); $('desk-panel').classList.add('hidden'); return; } try { currentRole = await roleFor(user); if (!['superadmin', 'editor', 'reporter'].includes(currentRole)) { await signOut(auth); status('login-status', 'This account has no editorial role.', true); return; } $('login-panel').classList.add('hidden'); $('desk-panel').classList.remove('hidden'); $('admin-user').textContent = `${user.email || 'Staff account'} · ${currentRole}`; bindForms(auth); resetArticleForm(); await loadAdminData(); } catch (error) { console.error('Role verification failed:', error); status('login-status', 'Could not verify editorial permissions.', true); } });
}
