import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { collection, getDocs, getFirestore, limit, orderBy, query, startAfter, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const DEFAULT_DEMO_VIDEOS = [
  { id: 'v-1', title: '🔴 SahiDon Is Live | PUBG MOBILE Kr | Noob Is Back 🤠', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream PUBG MOBILE on Omlet Arcade! Follow me for more: https://omlet.gg/d/profile/sahidongamingyt...', publishedAt: '1/26/2021, 1:12:10 PM' },
  { id: 'v-2', title: 'Thank You Guys For 600 SUBS & Support 🔥', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Thank you guys for 600 subs & support! Keep supporting!', publishedAt: '8/31/2020, 7:39:50 PM' },
  { id: 'v-3', title: 'Crafting Smithy 🛠️ & Metal Tools Unlocked! | ARK Survival', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream ARK: Survival Evolved on Omlet Arcade!', publishedAt: '11/20/2020, 7:41:21 PM' },
  { id: 'v-4', title: 'Watch me stream PUBG MOBILE on Omlet Arcade!', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream PUBG MOBILE on Omlet Arcade!', publishedAt: '1/23/2021, 12:06:12 PM' },
  { id: 'v-5', title: 'SahiDon Gaming Live Stream Highlights', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Official livestream highlights and clutch moments.', publishedAt: '1/21/2021, 9:52:51 AM' },
  { id: 'v-6', title: '🔴 This Match Took Me From Ace To Conqueror 🏆', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Insane Conqueror lobby push with top tier gameplay.', publishedAt: '8/27/2020, 7:12:48 PM' },
  { id: 'v-7', title: 'Playing TDM in PUBG Mobile (Insane Kills)', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'High kill TDM gameplay with M416 and Kar98k.', publishedAt: '6/29/2019, 9:37:33 PM' },
  { id: 'v-8', title: 'How To Tame A DODO Tutorial | ARK Mobile', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Step by step ARK Mobile tutorial for beginner survivalists.', publishedAt: '10/31/2020, 7:43:49 PM' },
  { id: 'v-9', title: 'YUGANTAR Exclusive: Global Tech & AI Revolution 2026', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Deep dive into the latest AI agents, quantum computing, and media automation.', publishedAt: '3/15/2026, 10:00:00 AM' },
  { id: 'v-10', title: 'Special Report: Financial Markets & Interest Rate Analysis', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Market insights and macroeconomic forecasts from leading analysts.', publishedAt: '3/14/2026, 2:30:00 PM' },
  { id: 'v-11', title: 'Behind The Scenes: Investigative Journalism & AI Tools', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'How modern newsrooms harness AI models for rapid fact checking.', publishedAt: '3/12/2026, 4:00:00 PM' },
  { id: 'v-12', title: 'Live Climate Summit & Renewable Energy Breakthroughs', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Global leaders convene to discuss green tech innovations and clean grid energy.', publishedAt: '3/10/2026, 11:20:00 AM' }
];

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
    loadedItems = DEFAULT_DEMO_VIDEOS;
    render(loadedItems);
    return;
  }
  try {
    const constraints = [where('active', '==', true), orderBy('publishedAt', 'desc'), limit(12)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(collection(db, 'videoItems'), ...constraints));
    loadedItems = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    if (!loadedItems.length && page === 1) loadedItems = DEFAULT_DEMO_VIDEOS;
    history[page] = snapshot.docs[snapshot.docs.length - 1] || null;
    render(loadedItems);
  } catch (error) {
    console.error(error);
    loadedItems = DEFAULT_DEMO_VIDEOS;
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
