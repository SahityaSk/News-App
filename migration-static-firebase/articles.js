import { collection, getDocs, getFirestore, limit, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const text = (value, fallback = '') => typeof value === 'string' ? value : (value?.BN || fallback);
const dateText = value => { const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null); return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('bn-BD') : 'সম্প্রতি'; };
const image = (url, alt) => safeUrl(url) ? `<div class="media-frame"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.parentElement.classList.add('media-fallback'); this.remove()"></div>` : '<div class="media-frame media-fallback"><span class="media-fallback-label">YUGANTAR</span></div>';
const demoIds = new Set([...Array.from({ length: 6 }, (_, i) => `demo-art-${i + 1}`), ...Array.from({ length: 10 }, (_, i) => `art-${i + 1}`), ...Array.from({ length: 6 }, (_, i) => `art-art-${i + 1}`)]);
const isDemo = item => item.isDemo === true || demoIds.has(String(item.id || ''));
const pageSize = 12;
let allItems = [], page = 1, searchTerm = '';

function filteredItems() { const term = searchTerm.trim().toLowerCase(); return allItems.filter(item => !isDemo(item) && text(item.title) && text(item.summary) && (!term || `${text(item.title)} ${text(item.summary)} ${item.sourceAgency || ''}`.toLowerCase().includes(term))); }
function pageButtons(totalPages) {
  if (totalPages <= 1) return '';
  const values = new Set([1, totalPages]); for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i += 1) values.add(i);
  const sorted = [...values].sort((a, b) => a - b); let last = 0; const html = [];
  sorted.forEach(number => { if (number - last > 1) html.push('<span class="pagination-ellipsis">…</span>'); html.push(`<button class="page-number${number === page ? ' active' : ''}" type="button" data-page="${number}" aria-label="পৃষ্ঠা ${number}"${number === page ? ' aria-current="page"' : ''}>${number}</button>`); last = number; });
  return html.join('');
}
function render() {
  const items = filteredItems(); const totalPages = Math.max(1, Math.ceil(items.length / pageSize)); page = Math.min(page, totalPages); const visible = items.slice((page - 1) * pageSize, page * pageSize);
  $('all-articles').innerHTML = visible.length ? visible.map(item => { const title = text(item.title, 'শিরোনামহীন খবর'); return `<article class="article-card"><a class="archive-card-link" href="${escapeHtml(safeUrl(item.sourceUrl) || '#')}"${safeUrl(item.sourceUrl) ? ' target="_blank" rel="noreferrer"' : ''}>${image(item.image, title)}<div class="article-body"><span class="tag">${escapeHtml(item.category || 'সাধারণ')}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text(item.summary, 'বিস্তারিত জানতে মূল সংবাদটি পড়ুন।'))}</p><small>${escapeHtml(item.sourceAgency || item.author || 'YUGANTAR')} · ${escapeHtml(dateText(item.publishedAt))}</small></div></a></article>`; }).join('') : `<div class="empty-state">${searchTerm ? 'এই খোঁজের সঙ্গে মেলা কোনো খবর নেই।' : 'এখনও কোনো প্রকাশিত খবর নেই।'}</div>`;
  const nav = $('article-pagination'); nav.innerHTML = `<button class="button button-muted" type="button" data-prev ${page === 1 ? 'disabled' : ''}>আগের পৃষ্ঠা</button><div class="page-number-list">${pageButtons(totalPages)}</div><button class="button" type="button" data-next ${page === totalPages ? 'disabled' : ''}>পরের পৃষ্ঠা</button>`;
  nav.querySelector('[data-prev]').onclick = () => { if (page > 1) { page -= 1; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }; nav.querySelector('[data-next]').onclick = () => { if (page < totalPages) { page += 1; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }; nav.querySelectorAll('[data-page]').forEach(button => button.onclick = () => { page = Number(button.dataset.page); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('articles-status').textContent = items.length ? `${items.length}টি খবর · পৃষ্ঠা ${page} / ${totalPages}` : '';
}
async function load() { if (!firebaseConfigured) return render(); try { const db = getFirestore(initializeApp(firebaseConfig)); const snapshot = await getDocs(query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(500))); allItems = snapshot.docs.map(item => ({ id: item.id, ...item.data() })); } catch (error) { console.error('Could not load article archive:', error); $('all-articles').innerHTML = '<div class="empty-state">খবর লোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।</div>'; $('article-pagination').innerHTML = ''; $('articles-status').textContent = ''; return; } render(); }
$('article-search').addEventListener('input', event => { searchTerm = event.target.value; page = 1; render(); }); load();
