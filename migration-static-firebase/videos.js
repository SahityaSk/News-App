import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { collection, getDocs, getFirestore, limit, orderBy, query, startAfter, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const youtubeId = value => String(value || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&/]+)/i)?.[1] || '';
const dateText = value => { const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null); return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'Recently'; };

let db;
let page = 1;
let cursor = null;
const history = [];
let loadedItems = [];
let searchTerm = '';

function render(items) {
  const term = searchTerm.trim().toLowerCase();
  const filtered = term ? items.filter(item => `${item.title || ''} ${item.description || ''}`.toLowerCase().includes(term)) : items;

  $('all-videos').innerHTML = filtered.length ? filtered.map(item => {
    const id = youtubeId(item.videoUrl || item.embedUrl);
    const url = safeUrl(item.videoUrl || item.sourceUrl);
    const thumb = safeUrl(item.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''));
    const media = id ? `<div class="social-embed"><iframe title="${escapeHtml(item.title || 'YouTube video')}" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>` : (thumb ? `<div class="media-frame"><img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}"></div>` : '<div class="media-frame media-fallback"><span class="media-fallback-label">YUGANTAR</span></div>');
    return `<article class="video-card social-card">${media}<div><span class="tag">YOUTUBE · VIDEO</span><h2>${escapeHtml(item.title || 'Untitled video')}</h2><p class="social-description">${escapeHtml(item.description || 'Official video from the YUGANTAR channel.')}</p><small>${escapeHtml(dateText(item.publishedAt))}</small><div class="social-actions">${url ? `<a class="button button-outline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">View on YouTube</a>` : ''}</div></div></article>`;
  }).join('') : `<div class="empty-state">${term ? `No videos match "${escapeHtml(term)}".` : 'No official videos are available yet.'}</div>`;

  if (term) {
    $('previous-page').disabled = true;
    $('next-page').disabled = true;
    $('videos-status').textContent = `Found ${filtered.length} matching video${filtered.length === 1 ? '' : 's'} for "${term}".`;
  } else {
    $('page-status').textContent = `Page ${page}`;
    $('previous-page').disabled = page === 1;
    $('next-page').disabled = loadedItems.length < 12;
    $('videos-status').textContent = loadedItems.length ? `${loadedItems.length} videos on this page.` : 'No more videos.';
  }
}

async function loadVideos() {
  if (!firebaseConfigured) {
    loadedItems = [];
    render(loadedItems);
    return;
  }
  try {
    const constraints = [where('active', '==', true), orderBy('publishedAt', 'desc'), limit(12)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(collection(db, 'videoItems'), ...constraints));
    loadedItems = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    history[page] = snapshot.docs[snapshot.docs.length - 1] || null;
    render(loadedItems);
  } catch (error) {
    console.error(error);
    loadedItems = [];
    render(loadedItems);
  }
}

$('previous-page').onclick = () => { if (page <= 1 || searchTerm) return; page -= 1; cursor = page === 1 ? null : history[page - 1]; loadVideos(); };
$('next-page').onclick = () => { if (!history[page] || searchTerm) return; cursor = history[page]; page += 1; loadVideos(); };
$('video-search')?.addEventListener('input', event => {
  searchTerm = event.target.value;
  render(loadedItems);
});

if (firebaseConfigured) {
  db = getFirestore(initializeApp(firebaseConfig));
  loadVideos();
} else {
  loadVideos();
}
