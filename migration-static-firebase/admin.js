import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS } from './wb-map-data.js';
import { ARTICLE_CATEGORIES, DISTRICT_SUBCATEGORIES } from './district-content.js';

const $ = id => document.getElementById(id);
const status = (id, message, error = false) => { const node = $(id); if (node) { node.textContent = message; node.className = `status${error ? ' error' : ''}`; } };
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const languageObject = (en, bn, hi) => ({ EN: en.trim(), BN: bn.trim(), HI: hi.trim() });
const DEMO_ARTICLE_IDS = new Set([
  ...Array.from({ length: 6 }, (_, index) => `demo-art-${index + 1}`),
  ...Array.from({ length: 10 }, (_, index) => `art-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `art-art-${index + 1}`)
]);
const isDemoArticle = article => article?.isDemo === true || DEMO_ARTICLE_IDS.has(String(article?.id || ''));
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
let podcastCache = [];
let editingPodcastId = '';
let pollCache = [];
let pollVoteCounts = new Map();
let jobApplicationCache = [];
let applicationSearchQuery = '';
let sponsorCache = [];
let editingSponsorId = '';
let activeAuth;

const sunIconSvg = `<svg class="theme-icon-svg sun-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const moonIconSvg = `<svg class="theme-icon-svg moon-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>`;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = $('admin-theme-toggle');
  if (button) {
    button.innerHTML = theme === 'dark' ? moonIconSvg : sunIconSvg;
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
  try { localStorage.setItem('yugantar_theme', theme); } catch {}
}

function bindTheme() {
  let saved = null; try { saved = localStorage.getItem('yugantar_theme'); } catch {}
  const hour = new Date().getHours();
  const defaultTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
  setTheme(saved || defaultTheme);
  $('admin-theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

async function roleFor(user) { const profile = await getDoc(doc(db, 'users', user.uid)); return profile.exists() ? profile.data().role : ''; }

function articlePayload(auth) {
  const requestedStatus = $('article-status-select').value;
  const articleStatus = currentRole === 'reporter' ? 'draft' : requestedStatus;
  const category = $('article-category').value;
  const districtId = $('article-district')?.value || '';
  const coverageScope = $('article-coverage-scope')?.value || (districtId ? 'district' : 'state');
  if (articleStatus === 'published' && category !== 'world' && (! $('article-title-bn').value.trim() || ! $('article-summary-bn').value.trim() || ! $('article-content-bn').value.trim())) {
    throw new Error('Add the Bengali headline, summary, and story before publishing this article.');
  }
  return {
    title: languageObject($('article-title-en').value, $('article-title-bn').value, $('article-title-hi').value),
    summary: languageObject($('article-summary-en').value, $('article-summary-bn').value, $('article-summary-hi').value), content: languageObject($('article-content-en').value, $('article-content-bn').value, $('article-content-hi').value),
    category, subcategory: $('article-subcategory')?.value || 'other', districtId, primaryDistrictId: districtId, districtIds: districtId ? [districtId] : [], coverageScope, author: $('article-author').value.trim(), sourceAgency: $('article-source-agency').value.trim(), sourceUrl: readUrl($('article-source-url').value), image: readUrl($('article-image').value), sourceLanguage: 'EN', status: articleStatus, hero: $('article-hero').checked, trending: false, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid
  };
}

function resetArticleForm() {
  editingArticleId = ''; $('article-form').reset(); $('article-author').value = 'YUGANTAR Editorial'; $('article-source-agency').value = 'YUGANTAR'; $('article-status-select').value = currentRole === 'reporter' ? 'draft' : 'published'; $('article-submit').textContent = 'Publish article'; $('article-reset').classList.add('hidden'); $('article-image-preview').textContent = 'Cover preview appears here'; document.querySelector('[data-article-language="EN"]')?.click(); updateArticleEditorPreview();
}

function populateDistrictFields() {
  const category = $('article-category');
  const district = $('article-district');
  const subcategory = $('article-subcategory');
  if (category) category.innerHTML = ARTICLE_CATEGORIES.map(item => `<option value="${item.id}">${item.label.EN} · ${item.label.BN} · ${item.label.HI}</option>`).join('');
  if (district && !district.options.length) district.innerHTML = '<option value="">State-wide / no specific district · রাজ্যব্যাপী / নির্দিষ্ট জেলা নয় · राज्यव्यापी / कोई विशिष्ट जिला नहीं</option>' + WB_DISTRICTS.map(item => `<option value="${item.id}">${item.nameEn || item.id} · ${item.nameBn || item.nameEn || item.id} · ${item.nameHi || item.nameEn || item.id}</option>`).join('');
  if (subcategory && !subcategory.options.length) subcategory.innerHTML = DISTRICT_SUBCATEGORIES.map(item => `<option value="${item.id}">${item.label.EN} · ${item.label.BN} · ${item.label.HI}</option>`).join('');
  const tickerDistrict = $('ticker-district');
  if (tickerDistrict && !tickerDistrict.options.length) tickerDistrict.innerHTML = '<option value="">Global ticker · সার্বজনীন টিকার · वैश्विक टिकर</option>' + WB_DISTRICTS.map(item => `<option value="${item.id}">${item.nameEn || item.id} · ${item.nameBn || item.nameEn || item.id} · ${item.nameHi || item.nameEn || item.id}</option>`).join('');
}

function updateImagePreview() {
  const url = readUrl($('article-image').value); const preview = $('article-image-preview');
  preview.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Cover preview" onerror="this.parentElement.textContent='This image URL could not be loaded.'">` : 'Cover preview appears here';
}

function updateArticleEditorPreview() {
  const active = document.querySelector('.article-language-tab.active')?.dataset.articleLanguage || 'EN';
  const title = $('article-title-' + active.toLowerCase())?.value.trim() || 'Untitled article';
  const summary = $('article-summary-' + active.toLowerCase())?.value.trim() || 'Add a short summary for readers.';
  const content = $('article-content-' + active.toLowerCase())?.value.trim() || 'Your story preview will appear here.';
  const target = $('article-live-preview');
  const count = $('article-editor-count');
  if (target) target.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(summary)}</p><div>${escapeHtml(content.slice(0, 420))}${content.length > 420 ? '…' : ''}</div>`;
  if (count) count.textContent = `${content.length} characters · ${active}`;
}

function bindArticleEditor() {
  document.querySelectorAll('[data-article-language]').forEach(tab => tab.addEventListener('click', () => {
    const language = tab.dataset.articleLanguage;
    document.querySelectorAll('[data-article-language]').forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); });
    document.querySelectorAll('[data-article-language-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.articleLanguagePanel === language));
    updateArticleEditorPreview();
  }));
  ['en', 'bn', 'hi'].forEach(language => ['title', 'summary', 'content'].forEach(field => $(`article-${field}-${language}`)?.addEventListener('input', updateArticleEditorPreview)));
  updateArticleEditorPreview();
}

let articleSearchQuery = '';
let videoSearchQuery = '';
let hiddenVideoSearchQuery = '';

function renderArticleList() {
  const target = $('article-list');
  const filtered = articleSearchQuery 
    ? articleCache.filter(item => (displayText(item.title) || '').toLowerCase().includes(articleSearchQuery))
    : articleCache;
  if (!filtered.length) { target.innerHTML = `<div class="empty-state">${articleSearchQuery ? 'No articles match "' + escapeHtml(articleSearchQuery) + '"' : 'No articles found.'}</div>`; return; }
  target.innerHTML = filtered.map(article => {
    const moderationButton = currentRole !== 'reporter'
      ? (article.status === 'published'
        ? `<button class="text-button" type="button" data-draft-article="${escapeHtml(article.id)}">Make draft</button>`
        : `<button class="text-button" type="button" data-approve-article="${escapeHtml(article.id)}">Approve</button>`)
      : '';
    const rejectButton = currentRole !== 'reporter' && ['draft', 'submitted', 'under_review'].includes(article.status)
      ? `<button class="text-button danger" type="button" data-reject-article="${escapeHtml(article.id)}">Reject</button>` : '';
    return `<div class="admin-list-item"><div><strong>${escapeHtml(displayText(article.title))}</strong><small><span class="status-chip ${escapeHtml(article.status || 'draft')}">${escapeHtml(article.status || 'draft')}</span> ${escapeHtml(article.category || 'news')} · ${escapeHtml(article.subcategory || 'general')} · ${escapeHtml(article.districtId || 'state-wide')} · ${escapeHtml(article.author || 'YUGANTAR')} · ${escapeHtml(dateText(article.updatedAt || article.publishedAt))}</small></div><div class="item-actions"><button class="text-button" type="button" data-edit-article="${escapeHtml(article.id)}">Edit</button>${moderationButton}${rejectButton}${currentRole !== 'reporter' ? `<button class="text-button danger" type="button" data-delete-article="${escapeHtml(article.id)}">Delete</button>` : ''}</div></div>`;
  }).join('');
  target.querySelectorAll('[data-edit-article]').forEach(button => button.addEventListener('click', () => editArticle(button.dataset.editArticle)));
  target.querySelectorAll('[data-delete-article]').forEach(button => button.addEventListener('click', () => deleteArticle(button.dataset.deleteArticle)));
  target.querySelectorAll('[data-approve-article]').forEach(button => button.addEventListener('click', () => moderateArticle(button.dataset.approveArticle, 'published')));
  target.querySelectorAll('[data-draft-article]').forEach(button => button.addEventListener('click', () => moderateArticle(button.dataset.draftArticle, 'draft')));
  target.querySelectorAll('[data-reject-article]').forEach(button => button.addEventListener('click', () => moderateArticle(button.dataset.rejectArticle, 'rejected')));
}

async function moderateArticle(id, nextStatus) {
  const article = articleCache.find(item => item.id === id);
  const actionLabel = nextStatus === 'published' ? 'approve and publish' : nextStatus === 'draft' ? 'move back to draft' : 'reject';
  if (!window.confirm(`Are you sure you want to ${actionLabel} this article?`)) return;
  if (nextStatus === 'published' && article?.districtId && (!article.title?.BN || !article.summary?.BN || !article.content?.BN)) {
    status('admin-data-status', 'Add Bengali headline, summary, and story before publishing district news.', true);
    return;
  }
  const note = nextStatus === 'rejected' ? window.prompt('Reason for rejection (shown privately to the reporter):', '') : '';
  if (nextStatus === 'rejected' && note === null) return;
  try {
    await updateDoc(doc(db, 'articles', id), { status: nextStatus, reviewNote: note || '', reviewedBy: activeAuth.currentUser.uid, reviewedAt: serverTimestamp(), ...(nextStatus === 'published' ? { publishedAt: serverTimestamp() } : {}), updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid });
    status('admin-data-status', nextStatus === 'published' ? 'Article approved and published.' : 'Article rejected with feedback.');
    await loadAdminData();
  } catch (error) { status('admin-data-status', error.message, true); }
}

function renderSimpleList(targetId, items, type) {
  const target = $(targetId);
  const query = type === 'video' ? videoSearchQuery : '';
  const filtered = query 
    ? items.filter(item => (item.title || '').toLowerCase().includes(query))
    : items;
  if (!filtered.length) { target.innerHTML = `<div class="empty-state">${query ? 'No videos match "' + escapeHtml(query) + '"' : 'No items found.'}</div>`; return; }
  target.innerHTML = filtered.map(item => {
    const label = type === 'ticker' ? displayText(item.title) : item.title || 'Untitled';
    const actions = type === 'video'
      ? `<button class="text-button" type="button" data-edit-video="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-hide-video="${escapeHtml(item.id)}">Hide</button>`
      : `<button class="text-button" type="button" data-edit-ticker="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-delete-ticker="${escapeHtml(item.id)}">Delete</button>`;
    const destination = type === 'ticker' ? (item.districtId ? `District · ${item.districtId}` : 'Main website') : (item.provider || item.category || 'YUGANTAR');
    return `<div class="admin-list-item"><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(destination)} · ${escapeHtml(dateText(item.updatedAt || item.publishedAt))}</small></div><div class="item-actions">${actions}</div></div>`;
  }).join('');
  target.querySelectorAll('[data-edit-video]').forEach(button => button.addEventListener('click', () => editVideo(button.dataset.editVideo)));
  target.querySelectorAll('[data-hide-video]').forEach(button => button.addEventListener('click', () => hideVideo(button.dataset.hideVideo)));
  target.querySelectorAll('[data-edit-ticker]').forEach(button => button.addEventListener('click', () => editTicker(button.dataset.editTicker)));
  target.querySelectorAll('[data-delete-ticker]').forEach(button => button.addEventListener('click', () => deleteTicker(button.dataset.deleteTicker)));
}

function renderPodcastList() {
  const target = $('podcast-list');
  if (!target) return;
  if (!podcastCache.length) { target.innerHTML = '<div class="empty-state">No podcasts found.</div>'; return; }
  target.innerHTML = podcastCache.map(item => `<div class="admin-list-item"><div><strong>${escapeHtml(item.title || 'Untitled podcast')}</strong><small><span class="status-chip ${escapeHtml(item.status || 'draft')}">${escapeHtml(item.status || 'draft')}</span> · ${item.active === false ? 'Hidden' : 'Visible'} · ${escapeHtml(dateText(item.updatedAt || item.publishedAt))}</small></div><div class="item-actions"><button class="text-button" type="button" data-edit-podcast="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-delete-podcast="${escapeHtml(item.id)}">Delete</button></div></div>`).join('');
  target.querySelectorAll('[data-edit-podcast]').forEach(button => button.addEventListener('click', () => editPodcast(button.dataset.editPodcast)));
  target.querySelectorAll('[data-delete-podcast]').forEach(button => button.addEventListener('click', () => deletePodcast(button.dataset.deletePodcast)));
}

function resetPodcastForm() {
  const form = $('podcast-form');
  if (!form) return;
  editingPodcastId = '';
  form.reset();
  $('podcast-status-select').value = 'published';
  $('podcast-active').checked = true;
  $('podcast-submit').textContent = 'Publish podcast';
  $('podcast-reset').classList.add('hidden');
}

function editPodcast(id) {
  const item = podcastCache.find(podcast => podcast.id === id);
  if (!item) return;
  editingPodcastId = id;
  $('podcast-title').value = item.title || '';
  $('podcast-description').value = item.description || '';
  $('podcast-thumbnail').value = item.thumbnail || item.image || '';
  $('podcast-facebook-url').value = item.facebookUrl || item.sourceUrl || '';
  $('podcast-status-select').value = item.status || 'published';
  $('podcast-active').checked = item.active !== false;
  $('podcast-submit').textContent = 'Save podcast changes';
  $('podcast-reset').classList.remove('hidden');
  document.querySelector('[data-admin-tab="podcasts"]')?.click();
}

async function deletePodcast(id) {
  const item = podcastCache.find(podcast => podcast.id === id);
  if (!item || !window.confirm(`Delete podcast “${item.title || 'this podcast'}”? This cannot be undone.`)) return;
  try { await deleteDoc(doc(db, 'podcasts', id)); status('podcast-status', 'Podcast deleted.'); await loadAdminData(); }
  catch (error) { status('podcast-status', error.message, true); }
}

async function loadAdminData() {
  status('admin-data-status', 'Refreshing newsroom data…');
  try {
    const readCollection = async name => {
      try { return { name, snapshot: await getDocs(collection(db, name)) }; }
      catch (error) { console.warn(`Could not read ${name}:`, error); return { name, snapshot: { docs: [] }, error }; }
    };
    const results = await Promise.all([
      currentRole === 'reporter' ? Promise.resolve({ name: 'jobApplications', snapshot: { docs: [] } }) : readCollection('jobApplications'),
      currentRole === 'reporter' ? Promise.resolve({ name: 'sponsors', snapshot: { docs: [] } }) : readCollection('sponsors'),
      readCollection('articles'), readCollection('tickers'), readCollection('videoItems'), readCollection('videoControls'), readCollection('podcasts'), readCollection('liveStreams')
    ]);
    const byName = name => results.find(result => result.name === name) || { name, snapshot: { docs: [] } };
    const applicationsSnapshot = byName('jobApplications').snapshot;
    const sponsorsSnapshot = byName('sponsors').snapshot;
    const articlesSnapshot = byName('articles').snapshot;
    const tickersSnapshot = byName('tickers').snapshot;
    const videosSnapshot = byName('videoItems').snapshot;
    const controlsSnapshot = byName('videoControls').snapshot;
    const podcastsSnapshot = byName('podcasts').snapshot;
    const liveStreamsSnapshot = byName('liveStreams').snapshot;
    const primaryLiveStream = liveStreamsSnapshot.docs.find(item => item.id === 'primary');
    jobApplicationCache = applicationsSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    sponsorCache = sponsorsSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
    articleCache = articlesSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter(article => !isDemoArticle(article)).sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    const hiddenIds = new Set(controlsSnapshot.docs.filter(item => item.data().hidden === true).map(item => item.id));
    const allVideos = videosSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    videoCache = allVideos.filter(item => item.active !== false && !hiddenIds.has(item.id)).sort((a, b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0));
    hiddenVideoCache = allVideos.filter(item => item.active === false || hiddenIds.has(item.id)).sort((a, b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0));
    const tickers = tickerCache = tickersSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => item.active !== false);
    tickerCache.sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
    podcastCache = podcastsSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.updatedAt?.toMillis?.() || b.publishedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || a.publishedAt?.toMillis?.() || 0));
    hydrateLiveStream(primaryLiveStream ? { id: primaryLiveStream.id, ...primaryLiveStream.data() } : null);
    $('stat-articles').textContent = articleCache.filter(item => item.status === 'published').length;
    $('stat-drafts').textContent = articleCache.filter(item => item.status === 'draft').length;
    $('stat-review').textContent = articleCache.filter(item => ['submitted', 'under_review'].includes(item.status)).length;
    $('stat-videos').textContent = videoCache.length;
    $('stat-tickers').textContent = tickerCache.length;
    $('stat-applications').textContent = jobApplicationCache.length;
    const pollsResult = await readCollection('polls');
    const pollSnapshot = pollsResult.snapshot;
    pollVoteCounts = new Map();
    pollCache = await Promise.all(pollSnapshot.docs.map(async item => { const votes = await getDocs(collection(db, 'polls', item.id, 'votes')).catch(() => ({ size: 0 })); pollVoteCounts.set(item.id, votes.size || 0); return { id: item.id, ...item.data() }; }));
    pollCache.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    renderArticleList(); renderSimpleList('video-list', videoCache, 'video'); renderHiddenVideos(); renderSimpleList('ticker-list', tickerCache, 'ticker'); renderPodcastList(); renderPollList(); renderJobApplications(); renderSponsors();
    $('last-refresh').textContent = `Updated ${new Date().toLocaleTimeString()}`;
    const failedSections = results.concat(pollsResult).filter(result => result.error).map(result => result.name);
    status('admin-data-status', failedSections.length ? `Data loaded with limited sections. Deploy Firestore rules for: ${failedSections.join(', ')}.` : 'Data refreshed.', Boolean(failedSections.length));
  } catch (error) { console.error('Admin data load failed:', error); status('admin-data-status', `Could not load editorial data: ${error.message || 'check Firestore rules.'}`, true); }
}

function renderJobApplications() {
  const target = $('job-application-list');
  if (!target) return;
  const filtered = applicationSearchQuery
    ? jobApplicationCache.filter(item => `${item.name || ''} ${item.email || ''} ${item.position || ''} ${item.district || ''}`.toLowerCase().includes(applicationSearchQuery))
    : jobApplicationCache;
  if (!filtered.length) { target.innerHTML = '<div class="empty-state">No job applications found.</div>'; return; }
  const statuses = ['received', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'];
  target.innerHTML = filtered.map(item => `<div class="admin-list-item"><div><strong>${escapeHtml(item.name || 'Unnamed candidate')}</strong><small>${escapeHtml(item.position || 'Open application')} · ${escapeHtml(item.district || 'Location not provided')} · ${escapeHtml(dateText(item.createdAt))}</small><p class="muted" style="margin:6px 0 0;">${escapeHtml(item.email || '')} · ${escapeHtml(item.phone || '')}</p>${item.pitch ? `<p class="muted" style="margin:4px 0 0;">${escapeHtml(item.pitch)}</p>` : ''}${readUrl(item.portfolioUrl) ? `<a href="${escapeHtml(readUrl(item.portfolioUrl))}" target="_blank" rel="noreferrer">View portfolio / resume link</a>` : ''}</div><div class="item-actions"><select data-application-status="${escapeHtml(item.id)}" aria-label="Application status for ${escapeHtml(item.name || 'candidate')}">${statuses.map(value => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div></div>`).join('');
  target.querySelectorAll('[data-application-status]').forEach(select => select.addEventListener('change', () => updateApplicationStatus(select.dataset.applicationStatus, select.value)));
}

async function updateApplicationStatus(id, nextStatus) {
  if (!['received', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'].includes(nextStatus)) return;
  try {
    await updateDoc(doc(db, 'jobApplications', id), { status: nextStatus, updatedAt: serverTimestamp(), updatedBy: activeAuth.currentUser.uid });
    const item = jobApplicationCache.find(application => application.id === id);
    if (item) item.status = nextStatus;
    status('admin-data-status', 'Application status updated.');
  } catch (error) {
    status('admin-data-status', error.message, true);
    await loadAdminData();
  }
}

function resetSponsorForm() {
  $('sponsor-form')?.reset();
  editingSponsorId = '';
  $('sponsor-active').checked = true;
  $('sponsor-priority').value = '1';
  $('sponsor-submit').textContent = 'Save sponsor';
  $('sponsor-reset').classList.add('hidden');
}

function renderSponsors() {
  const target = $('sponsor-list');
  if (!target) return;
  if (!sponsorCache.length) { target.innerHTML = '<div class="empty-state">No sponsor records found.</div>'; return; }
  target.innerHTML = sponsorCache.map(item => `<div class="admin-list-item"><div style="display:flex;align-items:center;gap:10px;"><img src="${escapeHtml(readUrl(item.logo))}" alt="" style="width:38px;height:38px;object-fit:contain;border-radius:8px;background:#fff;" onerror="this.style.display='none'"><div><strong>${escapeHtml(item.name || 'Unnamed sponsor')}</strong><small>${escapeHtml(item.category || 'partner')} · ${item.active === false ? 'hidden' : 'active'}</small></div></div><div class="item-actions"><button class="text-button" type="button" data-edit-sponsor="${escapeHtml(item.id)}">Edit</button><button class="text-button danger" type="button" data-delete-sponsor="${escapeHtml(item.id)}">Delete</button></div></div>`).join('');
  target.querySelectorAll('[data-edit-sponsor]').forEach(button => button.addEventListener('click', () => editSponsor(button.dataset.editSponsor)));
  target.querySelectorAll('[data-delete-sponsor]').forEach(button => button.addEventListener('click', () => deleteSponsor(button.dataset.deleteSponsor)));
}

function editSponsor(id) {
  const sponsor = sponsorCache.find(item => item.id === id);
  if (!sponsor) return;
  editingSponsorId = id;
  $('sponsor-name').value = sponsor.name || '';
  $('sponsor-tagline').value = sponsor.tagline || '';
  $('sponsor-logo').value = sponsor.logo || '';
  $('sponsor-website').value = sponsor.website || '';
  $('sponsor-description').value = sponsor.description || '';
  $('sponsor-category').value = sponsor.category || 'gold';
  $('sponsor-priority').value = sponsor.priority ?? 1;
  $('sponsor-banner').value = sponsor.bannerBg || '';
  $('sponsor-active').checked = sponsor.active !== false;
  $('sponsor-submit').textContent = 'Save sponsor changes';
  $('sponsor-reset').classList.remove('hidden');
  document.querySelector('[data-admin-tab="sponsors"]')?.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteSponsor(id) {
  const sponsor = sponsorCache.find(item => item.id === id);
  if (!sponsor || !window.confirm(`Delete sponsor “${sponsor.name || 'this sponsor'}”? This cannot be undone.`)) return;
  try { await deleteDoc(doc(db, 'sponsors', id)); status('sponsor-status', 'Sponsor deleted.'); await loadAdminData(); } catch (error) { status('sponsor-status', error.message, true); }
}

function editArticle(id) {
  const article = articleCache.find(item => item.id === id); if (!article) return;
  const sourceLanguage = article.sourceLanguage || 'EN';
  const title = typeof article.title === 'string' ? { [sourceLanguage]: article.title } : (article.title || {});
  const summary = typeof article.summary === 'string' ? { [sourceLanguage]: article.summary } : (article.summary || {});
  const content = typeof article.content === 'string' ? { [sourceLanguage]: article.content } : (article.content || {});
  editingArticleId = id; $('article-title-en').value = title.EN || ''; $('article-title-bn').value = title.BN || ''; $('article-title-hi').value = title.HI || ''; $('article-summary-en').value = summary.EN || ''; $('article-summary-bn').value = summary.BN || ''; $('article-summary-hi').value = summary.HI || ''; $('article-content-en').value = content.EN || ''; $('article-content-bn').value = content.BN || ''; $('article-content-hi').value = content.HI || '';
  $('article-category').value = article.category || 'national'; $('article-subcategory').value = article.subcategory || 'other'; $('article-district').value = article.districtId || article.primaryDistrictId || ''; $('article-coverage-scope').value = article.coverageScope || (article.districtId ? 'district' : 'state'); $('article-author').value = article.author || ''; $('article-source-agency').value = article.sourceAgency || 'YUGANTAR'; $('article-image').value = article.image || ''; $('article-source-url').value = article.sourceUrl || ''; $('article-hero').checked = Boolean(article.hero); $('article-status-select').value = article.status || 'draft'; $('article-submit').textContent = 'Save article changes'; $('article-reset').classList.remove('hidden'); updateImagePreview();
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
  $('ticker-form').reset(); delete $('ticker-form').dataset.editingId; $('ticker-category').value = 'BREAKING'; $('ticker-priority').value = '1'; $('ticker-district').value = ''; $('ticker-submit').textContent = 'Publish ticker'; $('ticker-reset').classList.add('hidden');
}

function hydrateLiveStream(stream) {
  const form = $('stream-form');
  const deleteButton = $('stream-delete');
  if (!form || !deleteButton) return;
  if (!stream) {
    form.reset();
    $('stream-provider').value = 'youtube';
    $('stream-live').checked = true;
    deleteButton.classList.add('hidden');
    return;
  }
  $('stream-title').value = stream.title || '';
  $('stream-provider').value = stream.provider || 'youtube';
  $('stream-url').value = stream.videoUrl || '';
  $('stream-live').checked = stream.isLive !== false;
  deleteButton.classList.remove('hidden');
}

function editTicker(id) {
  const item = tickerCache.find(ticker => ticker.id === id); if (!item) return;
  const title = item.title || {}; $('ticker-en').value = title.EN || ''; $('ticker-bn').value = title.BN || ''; $('ticker-hi').value = title.HI || ''; $('ticker-category').value = item.category || 'BREAKING'; $('ticker-priority').value = item.priority ?? 1; $('ticker-district').value = item.districtId || '';
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
  populateDistrictFields();
  activeAuth = auth;
  bindArticleEditor();
  $('logout').onclick = () => signOut(auth); $('refresh-admin').onclick = loadAdminData; $('article-image').addEventListener('input', updateImagePreview); $('article-reset').onclick = resetArticleForm; $('video-reset').onclick = resetVideoForm; $('ticker-reset').onclick = resetTickerForm; $('poll-reset').onclick = resetPollForm; $('sponsor-reset').onclick = resetSponsorForm; $('podcast-reset').onclick = resetPodcastForm;
  $('search-articles')?.addEventListener('input', (e) => { articleSearchQuery = e.target.value.trim().toLowerCase(); renderArticleList(); });
  $('search-videos')?.addEventListener('input', (e) => { videoSearchQuery = e.target.value.trim().toLowerCase(); renderSimpleList('video-list', videoCache, 'video'); });
  $('search-hidden-videos')?.addEventListener('input', (e) => { hiddenVideoSearchQuery = e.target.value.trim().toLowerCase(); renderHiddenVideos(); });
  $('search-applications')?.addEventListener('input', (e) => { applicationSearchQuery = e.target.value.trim().toLowerCase(); renderJobApplications(); });
  document.querySelectorAll('[data-admin-tab]').forEach(button => button.addEventListener('click', () => { const name = button.dataset.adminTab; document.querySelectorAll('[data-admin-tab]').forEach(item => item.classList.toggle('active', item === button)); document.querySelectorAll('[data-admin-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.adminPanel === name)); }));
  $('article-form').onsubmit = async event => { event.preventDefault(); try { const data = articlePayload(auth); if (editingArticleId) { await updateDoc(doc(db, 'articles', editingArticleId), data); status('article-status', 'Article changes saved.'); } else { await addDoc(collection(db, 'articles'), { ...data, createdBy: auth.currentUser.uid, publishedAt: serverTimestamp() }); status('article-status', data.status === 'draft' ? 'Draft saved.' : 'Article published.'); } resetArticleForm(); await loadAdminData(); } catch (error) { status('article-status', error.message, true); } };
  $('poll-form').onsubmit = async event => { event.preventDefault(); try { const id = $('poll-form').dataset.editingId || ''; const data = pollPayload(); if (id) { const existing = pollCache.find(poll => poll.id === id); data.voteCounts = existing?.voteCounts || data.voteCounts; } if (data.active) await deactivateOtherPolls(id); if (id) { await updateDoc(doc(db, 'polls', id), data); status('poll-status', 'Poll changes saved.'); } else { await addDoc(collection(db, 'polls'), { ...data, createdAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('poll-status', 'Poll published.'); } resetPollForm(); await loadAdminData(); } catch (error) { status('poll-status', error.message, true); } };
  $('ticker-form').onsubmit = async event => { event.preventDefault(); try { const id = $('ticker-form').dataset.editingId; const data = { title: languageObject($('ticker-en')?.value || '', $('ticker-bn')?.value || '', $('ticker-hi')?.value || ''), category: $('ticker-category')?.value.trim().toUpperCase() || 'BREAKING', districtId: $('ticker-district')?.value || '', scope: $('ticker-district')?.value ? 'district' : 'global', priority: Number($('ticker-priority')?.value) || 1, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }; if (id) { await updateDoc(doc(db, 'tickers', id), data); status('ticker-status', 'Ticker changes saved.'); } else { await addDoc(collection(db, 'tickers'), { ...data, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('ticker-status', 'Ticker is live.'); } resetTickerForm(); await loadAdminData(); } catch (error) { status('ticker-status', error.message, true); } };
  $('podcast-form').onsubmit = async event => { event.preventDefault(); try { const title = $('podcast-title').value.trim(); const description = $('podcast-description').value.trim(); const thumbnail = readUrl($('podcast-thumbnail').value); const facebookUrl = readUrl($('podcast-facebook-url').value); if (!title || !facebookUrl) throw new Error('Podcast title and Facebook link are required.'); if ($('podcast-thumbnail').value.trim() && !thumbnail) throw new Error('Enter a valid thumbnail URL beginning with http:// or https://.'); const data = { title, description, thumbnail, facebookUrl, sourceUrl: facebookUrl, status: $('podcast-status-select').value, active: $('podcast-active').checked, featured: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }; if (editingPodcastId) { await updateDoc(doc(db, 'podcasts', editingPodcastId), data); status('podcast-status', 'Podcast changes saved.'); } else { await addDoc(collection(db, 'podcasts'), { ...data, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('podcast-status', 'Podcast published.'); } resetPodcastForm(); await loadAdminData(); } catch (error) { status('podcast-status', error.message, true); } };
  $('stream-form').onsubmit = async event => { event.preventDefault(); try { await setDoc(doc(db, 'liveStreams', 'primary'), { title: $('stream-title').value.trim(), provider: $('stream-provider').value, videoUrl: readUrl($('stream-url').value), isLive: $('stream-live').checked, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }); status('stream-status', 'Live stream saved.'); $('stream-delete').classList.remove('hidden'); } catch (error) { status('stream-status', error.message, true); } };
  $('stream-delete').onclick = async () => { if (!window.confirm('Delete the live stream? This cannot be undone.')) return; try { await deleteDoc(doc(db, 'liveStreams', 'primary')); $('stream-form').reset(); $('stream-delete').classList.add('hidden'); status('stream-status', 'Live stream deleted.'); } catch (error) { status('stream-status', error.message, true); } };
  $('video-form').onsubmit = async event => { event.preventDefault(); try { const id = $('video-form').dataset.editingId; const url = readUrl($('video-url').value); const provider = $('video-provider').value; const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&/]+)/i); const data = { title: $('video-title').value.trim(), description: $('video-description').value.trim(), provider, mediaType: provider === 'youtube' ? 'video' : 'post', videoUrl: url, embedUrl: provider === 'youtube' && match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url, thumbnail: readUrl($('video-thumbnail').value), sourceUrl: url, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }; if (id) { await updateDoc(doc(db, 'videoItems', id), data); status('video-status', 'Video changes saved.'); } else { await addDoc(collection(db, 'videoItems'), { ...data, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('video-status', 'Social item published.'); } resetVideoForm(); await loadAdminData(); } catch (error) { status('video-status', error.message, true); } };
  $('sponsor-form').onsubmit = async event => { event.preventDefault(); try {
    const name = $('sponsor-name').value.trim();
    const logoInput = $('sponsor-logo').value.trim();
    const logo = readUrl(logoInput);
    if (!name) throw new Error('Sponsor name is required.');
    if (!logo) throw new Error('Enter a valid image URL beginning with http:// or https://.');
    const data = { name, tagline: $('sponsor-tagline').value.trim(), logo, website: readUrl($('sponsor-website').value), description: $('sponsor-description').value.trim(), category: $('sponsor-category').value, priority: Number($('sponsor-priority').value) || 1, bannerBg: $('sponsor-banner').value.trim() || 'linear-gradient(135deg, #091526, #d92535)', active: $('sponsor-active').checked, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid };
    if (editingSponsorId) { await updateDoc(doc(db, 'sponsors', editingSponsorId), data); status('sponsor-status', 'Sponsor changes saved.'); } else { await addDoc(collection(db, 'sponsors'), { ...data, createdAt: serverTimestamp(), createdBy: auth.currentUser.uid }); status('sponsor-status', 'Sponsor added.'); }
    resetSponsorForm(); await loadAdminData();
  } catch (error) { status('sponsor-status', error.message, true); } };
  if (currentRole === 'reporter') { $('article-status-select').value = 'draft'; $('article-status-select').disabled = true; }
}

bindTheme();
if (!firebaseConfigured) { $('admin-setup').textContent = 'Firebase is not configured. Add the client configuration in firebase-config.js before deployment.'; $('admin-setup').classList.remove('hidden'); }
else {
  const app = initializeApp(firebaseConfig, 'yugantar-admin'); const auth = getAuth(app); db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);
  $('login-form').onsubmit = async event => { event.preventDefault(); try { status('login-status', 'Signing in…'); await signInWithEmailAndPassword(auth, $('login-email').value.trim(), $('login-password').value); } catch (error) { console.error('Firebase admin login failed:', error); const messages = { 'auth/invalid-credential': 'Email or password is incorrect.', 'auth/user-not-found': 'No Firebase Authentication user exists for this email.', 'auth/wrong-password': 'The password is incorrect.', 'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Authentication.', 'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication settings.' }; status('login-status', messages[error.code] || error.message || 'Firebase sign-in failed.', true); } };
  onAuthStateChanged(auth, async user => { if (!user) { $('login-panel').classList.remove('hidden'); $('desk-panel').classList.add('hidden'); return; } try { currentRole = await roleFor(user); if (!['superadmin', 'editor'].includes(currentRole)) { await signOut(auth); status('login-status', currentRole === 'reporter' ? 'Reporter accounts must use the Reporter Workspace.' : 'This account has no admin access.', true); return; } $('login-panel').classList.add('hidden'); $('desk-panel').classList.remove('hidden'); $('admin-user').textContent = `${user.email || 'Staff account'} · ${currentRole}`; bindForms(auth); resetArticleForm(); await loadAdminData(); } catch (error) { console.error('Role verification failed:', error); status('login-status', 'Could not verify editorial permissions.', true); } });
}
