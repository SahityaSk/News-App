import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { collection, getDocs, getFirestore, limit, orderBy, query, startAfter, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const youtubeId = value => String(value || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&/]+)/i)?.[1] || '';
const dateText = value => { const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null); return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('bn-BD') : 'সম্প্রতি'; };

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
    const provider = String(item.provider || 'youtube').toLowerCase();
    const id = provider === 'youtube' ? youtubeId(item.videoUrl || item.embedUrl) : '';
    const url = safeUrl(item.videoUrl || item.sourceUrl);
    const thumb = safeUrl(item.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''));
    const media = id ? `<div class="social-embed"><iframe title="${escapeHtml(item.title || 'ইউটিউব ভিডিও')}" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>` : (thumb ? `<div class="media-frame"><img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title || 'ভিডিও')}" ></div>` : '<div class="media-frame media-fallback"><span class="media-fallback-label">YUGANTAR</span></div>');
    const providerLabel = provider === 'facebook' ? 'ফেসবুক' : 'ইউটিউব';
    const mediaLabel = item.mediaType === 'post' ? 'পোস্ট' : 'ভিডিও';
    const actionLabel = provider === 'facebook' ? 'ফেসবুকে দেখুন' : 'ইউটিউবে দেখুন';
    return `<article class="video-card social-card">${media}<div><span class="tag">${providerLabel} · ${mediaLabel}</span><h2>${escapeHtml(item.title || 'শিরোনামহীন সোশ্যাল আইটেম')}</h2><p class="social-description">${escapeHtml(item.description || `যুগান্তর চ্যানেলের অফিসিয়াল ${providerLabel.toLowerCase()} আইটেম।`)}</p><small>${escapeHtml(dateText(item.publishedAt))}</small><div class="social-actions">${url ? `<a class="button button-outline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${actionLabel}</a>` : ''}</div></div></article>`;
  }).join('') : `<div class="empty-state">${term ? `"${escapeHtml(term)}"-এর সঙ্গে মেলা কোনো ভিডিও নেই।` : 'এখনও কোনো অফিসিয়াল ভিডিও পাওয়া যায়নি।'}</div>`;

  if (term) {
    $('previous-page').disabled = true;
    $('next-page').disabled = true;
    $('videos-status').textContent = `"${term}"-এর জন্য ${filtered.length}টি ভিডিও পাওয়া গেছে।`;
  } else {
    $('page-status').textContent = `পৃষ্ঠা ${page}`;
    $('previous-page').disabled = page === 1;
    $('next-page').disabled = loadedItems.length < 12;
    $('videos-status').textContent = loadedItems.length ? `এই পাতায় ${loadedItems.length}টি ভিডিও আছে।` : 'আর কোনো ভিডিও নেই।';
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
