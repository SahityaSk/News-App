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
  target.innerHTML = articleCache.slice(0, 30).map(article => `<div class="admin-list-item"><div><strong>${escapeHtml(displayText(article.title))}</strong><small><span class="status-chip ${escapeHtml(article.status || 'draft')}">${escapeHtml(article.status || 'draft')}</span> ${escapeHtml(article.category || 'news')} · ${escapeHtml(dateText(article.updatedAt || article.publishedAt))}</small></div><div class="item-actions"><button class="text-button" type="button" data-edit-article="${escapeHtml(article.id)}">Edit</button>${currentRole !== 'reporter' ? `<button class="text-button danger" type="button" data-delete-article="${escapeHtml(article.id)}">Delete</button>` : ''}</div></div>`).join('');
  target.querySelectorAll('[data-edit-article]').forEach(button => button.addEventListener('click', () => editArticle(button.dataset.editArticle)));
  target.querySelectorAll('[data-delete-article]').forEach(button => button.addEventListener('click', () => deleteArticle(button.dataset.deleteArticle)));
}

function renderSimpleList(targetId, items, type) {
  const target = $(targetId);
  if (!items.length) { target.innerHTML = '<div class="empty-state">No items found.</div>'; return; }
  target.innerHTML = items.slice(0, 12).map(item => `<div class="admin-list-item"><div><strong>${escapeHtml(type === 'ticker' ? displayText(item.title) : item.title || 'Untitled')}</strong><small>${escapeHtml(item.provider || item.category || 'YUGANTAR')} · ${escapeHtml(dateText(item.updatedAt || item.publishedAt))}</small></div></div>`).join('');
}

async function loadAdminData() {
  status('admin-data-status', 'Refreshing newsroom data…');
  try {
    const [articlesSnapshot, tickersSnapshot, videosSnapshot] = await Promise.all([getDocs(collection(db, 'articles')), getDocs(collection(db, 'tickers')), getDocs(collection(db, 'videoItems'))]);
    articleCache = articlesSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    const tickers = tickersSnapshot.docs.map(item => item.data()).filter(item => item.active !== false);
    const videos = videosSnapshot.docs.map(item => item.data()).filter(item => item.active !== false);
    $('stat-articles').textContent = articleCache.filter(item => item.status === 'published').length;
    $('stat-drafts').textContent = articleCache.filter(item => item.status === 'draft').length;
    $('stat-videos').textContent = videos.length;
    $('stat-tickers').textContent = tickers.length;
    renderArticleList(); renderSimpleList('video-list', videos, 'video'); renderSimpleList('ticker-list', tickers, 'ticker');
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

function bindForms(auth) {
  $('logout').onclick = () => signOut(auth); $('refresh-admin').onclick = loadAdminData; $('article-image').addEventListener('input', updateImagePreview); $('article-reset').onclick = resetArticleForm;
  document.querySelectorAll('[data-admin-tab]').forEach(button => button.addEventListener('click', () => { const name = button.dataset.adminTab; document.querySelectorAll('[data-admin-tab]').forEach(item => item.classList.toggle('active', item === button)); document.querySelectorAll('[data-admin-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.adminPanel === name)); }));
  $('article-form').onsubmit = async event => { event.preventDefault(); try { const data = articlePayload(auth); if (editingArticleId) { await updateDoc(doc(db, 'articles', editingArticleId), data); status('article-status', 'Article changes saved.'); } else { await addDoc(collection(db, 'articles'), { ...data, createdBy: auth.currentUser.uid, publishedAt: serverTimestamp() }); status('article-status', data.status === 'draft' ? 'Draft saved.' : 'Article published.'); } resetArticleForm(); await loadAdminData(); } catch (error) { status('article-status', error.message, true); } };
  $('ticker-form').onsubmit = async event => { event.preventDefault(); try { await addDoc(collection(db, 'tickers'), { title: languageObject($('ticker-en')?.value || '', $('ticker-bn')?.value || '', $('ticker-hi')?.value || ''), category: $('ticker-category')?.value.trim().toUpperCase() || 'BREAKING', priority: Number($('ticker-priority')?.value) || 1, active: true, publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }); $('ticker-form').reset(); status('ticker-status', 'Ticker is live.'); await loadAdminData(); } catch (error) { status('ticker-status', error.message, true); } };
  $('stream-form').onsubmit = async event => { event.preventDefault(); try { await setDoc(doc(db, 'liveStreams', 'primary'), { title: $('stream-title').value.trim(), provider: $('stream-provider').value, videoUrl: readUrl($('stream-url').value), isLive: $('stream-live').checked, active: true, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid }); $('stream-form').reset(); status('stream-status', 'Live stream saved.'); } catch (error) { status('stream-status', error.message, true); } };
  $('video-form').onsubmit = async event => { event.preventDefault(); try { await addDoc(collection(db, 'videoItems'), { title: $('video-title').value.trim(), provider: $('video-provider').value, videoUrl: readUrl($('video-url').value), thumbnail: readUrl($('video-thumbnail').value), sourceUrl: readUrl($('video-url').value), active: true, publishedAt: serverTimestamp(), createdBy: auth.currentUser.uid }); $('video-form').reset(); status('video-status', 'Video published.'); await loadAdminData(); } catch (error) { status('video-status', error.message, true); } };
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
