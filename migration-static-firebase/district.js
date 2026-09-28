import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS, WB_MAP_VIEWBOX, getDistrictNews } from './wb-map-data.js';

const $ = id => document.getElementById(id);
const savedKey = 'yugantar_saved_articles';
const savedLanguageKey = 'yugantar_language';

const getStoredLanguage = () => { try { return localStorage.getItem(savedLanguageKey) || 'BN'; } catch { return 'BN'; } };
const readSaved = () => { try { return JSON.parse(localStorage.getItem(savedKey) || '[]'); } catch { return []; } };

const state = {
  language: getStoredLanguage(),
  districtId: 'kolkata',
  category: 'all',
  search: '',
  articles: [],
  firestoreArticles: [],
  saved: readSaved()
};

let db;

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const isSaved = id => state.saved.some(art => art.id === id);
const text = (value, language = state.language) => typeof value === 'string' ? value : (value?.[language] || value?.EN || value?.BN || value?.HI || '');
const dateText = value => { const d = value?.toDate ? value.toDate() : (value ? new Date(value) : null); return d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : 'Recently'; };

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $('theme-toggle');
  if (toggle) {
    toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
  try { localStorage.setItem('yugantar_theme', theme); } catch {}
}

function updateClock() {
  const target = $('current-date');
  if (target) target.textContent = new Intl.DateTimeFormat(state.language === 'BN' ? 'bn-BD' : (state.language === 'HI' ? 'hi-IN' : undefined), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
}

function getUrlDistrict() {
  const params = new URLSearchParams(window.location.search);
  const distParam = params.get('district');
  if (!distParam) return 'kolkata';
  const found = WB_DISTRICTS.find(d => d.id === distParam.toLowerCase() || d.nameEn.toLowerCase() === distParam.toLowerCase());
  return found ? found.id : 'kolkata';
}

function populateDistrictSelect() {
  const select = $('district-select');
  if (!select) return;
  select.innerHTML = WB_DISTRICTS.map(d => `<option value="${d.id}" ${d.id === state.districtId ? 'selected' : ''}>${d.nameEn} (${d.nameBn})</option>`).join('');
  select.addEventListener('change', event => {
    switchDistrict(event.target.value);
  });
}

function renderMiniWbMapLegacy() {
  const container = $('mini-wb-map-container');
  if (!container) return;

  const currentDist = WB_DISTRICTS.find(d => d.id === state.districtId) || WB_DISTRICTS[0];

  const clipDefs = `
    <defs>
      <clipPath id="clip-paschim-medinipur-mini">
        <polygon points="200,840 342,840 332,975 200,975" />
      </clipPath>
      <clipPath id="clip-purba-medinipur-mini">
        <polygon points="342,840 430,840 430,975 332,975" />
      </clipPath>
      <clipPath id="clip-north-24-parganas-mini">
        <polygon points="470,780 640,780 640,918 470,918" />
      </clipPath>
      <clipPath id="clip-south-24-parganas-mini">
        <polygon points="470,918 640,918 640,1030 470,1030" />
      </clipPath>
    </defs>
  `;

  const sortedDistricts = [...WB_DISTRICTS].sort((a, b) => {
    const topOrder = { 'hooghly': 1, 'howrah': 2, 'kolkata': 3 };
    return (topOrder[a.id] || 0) - (topOrder[b.id] || 0);
  });

  const svgPaths = sortedDistricts.map(d => {
    const active = d.id === state.districtId;
    const baseColor = d.color || '#fef08a';

    let clipAttr = '';
    if (d.id === 'paschim-medinipur') clipAttr = ' clip-path="url(#clip-paschim-medinipur-mini)"';
    else if (d.id === 'purba-medinipur') clipAttr = ' clip-path="url(#clip-purba-medinipur-mini)"';
    else if (d.id === 'north-24-parganas') clipAttr = ' clip-path="url(#clip-north-24-parganas-mini)"';
    else if (d.id === 'south-24-parganas') clipAttr = ' clip-path="url(#clip-south-24-parganas-mini)"';

    return `<path d="${d.svgPath}"${clipAttr} fill="${active ? '#d92535' : baseColor}" stroke="${active ? '#ffffff' : '#334155'}" stroke-width="${active ? '2.5' : '1'}" class="mini-map-path ${active ? 'active' : ''}" data-district-id="${d.id}"><title>${d.nameEn} (${d.nameBn})</title></path>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="${WB_MAP_VIEWBOX}" width="100%" class="wb-svg-mini">
      ${clipDefs}
      <g>${svgPaths}</g>
    </svg>
  `;

  container.querySelectorAll('[data-district-id]').forEach(path => {
    path.addEventListener('click', () => {
      switchDistrict(path.dataset.districtId);
    });
  });

  const listTarget = $('district-list-quick');
  if (listTarget) {
    listTarget.innerHTML = WB_DISTRICTS.map(d => `<button class="district-chip ${d.id === state.districtId ? 'active' : ''}" data-district-id="${d.id}">${d.nameEn}</button>`).join('');
    listTarget.querySelectorAll('[data-district-id]').forEach(btn => {
      btn.addEventListener('click', () => switchDistrict(btn.dataset.districtId));
    });
  }
}

async function renderMiniWbMap() {
  const container = $('mini-wb-map-container');
  if (!container || !window.L) return;
  const currentDist = WB_DISTRICTS.find(d => d.id === state.districtId) || WB_DISTRICTS[0];
  const normalize = value => String(value || '').toLowerCase().replace(/pashchim/g, 'paschim').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const metadata = feature => WB_DISTRICTS.find(d => normalize(d.nameEn) === normalize(feature?.properties?.dtname || feature?.properties?.d_pan_name));
  container.innerHTML = '<div class="district-leaflet-map" aria-label="Clickable West Bengal district map"></div>';
  try {
    const response = await fetch('./assets/west-bengal-districts.geojson');
    if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);
    const geoJson = await response.json();
    const map = window.L.map(container.querySelector('.district-leaflet-map'), { zoomControl: false, scrollWheelZoom: false, dragging: false, attributionControl: false });
    const layer = window.L.geoJSON(geoJson, {
      style: feature => {
        const district = metadata(feature);
        const active = district?.id === currentDist.id;
        return { color: active ? '#ffffff' : '#334155', weight: active ? 2.5 : 1, fillColor: active ? '#d92535' : (district?.color || '#94a3b8'), fillOpacity: active ? 1 : 0.72 };
      },
      onEachFeature: (feature, featureLayer) => {
        const district = metadata(feature);
        if (!district) return;
        featureLayer.bindTooltip(district.nameEn, { sticky: true });
        featureLayer.on('click', () => switchDistrict(district.id));
        featureLayer.on('mouseover', event => event.target.setStyle({ weight: 2.5, color: '#ffffff', fillColor: '#d92535', fillOpacity: 1 }));
        featureLayer.on('mouseout', event => layer.resetStyle(event.target));
      }
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [4, 4] });
    window.setTimeout(() => map.invalidateSize(), 0);
  } catch (error) {
    console.error('District GeoJSON map failed:', error);
    container.innerHTML = '<div class="empty-state">Map unavailable. Use the district selector above.</div>';
  }

  const listTarget = $('district-list-quick');
  if (listTarget) {
    listTarget.innerHTML = WB_DISTRICTS.map(d => `<button class="district-chip ${d.id === state.districtId ? 'active' : ''}" data-district-id="${d.id}">${d.nameEn}</button>`).join('');
    listTarget.querySelectorAll('[data-district-id]').forEach(btn => btn.addEventListener('click', () => switchDistrict(btn.dataset.districtId)));
  }
}

function switchDistrict(newId) {
  state.districtId = newId;
  const newUrl = `${window.location.pathname}?district=${newId}`;
  window.history.pushState({ district: newId }, '', newUrl);
  populateDistrictSelect();
  renderDistrictHeader();
  renderMiniWbMap();
  loadDistrictArticles();
}

function renderDistrictHeader() {
  const d = WB_DISTRICTS.find(item => item.id === state.districtId) || WB_DISTRICTS[0];
  const titleEl = $('district-title');
  const subEl = $('district-subtitle');
  const hqEl = $('stat-hq');
  const regEl = $('stat-region');
  const countEl = $('stat-count');
  const regionPill = $('district-region-pill');
  const introDesc = $('district-intro-desc');
  const tickerEl = $('district-ticker');

  if (titleEl) titleEl.textContent = `${d.nameEn} (${d.nameBn})`;
  if (subEl) subEl.textContent = d.desc;
  if (hqEl) hqEl.textContent = d.hq;
  if (regEl) regEl.textContent = d.region;
  if (regionPill) regionPill.textContent = d.region.toUpperCase();
  if (introDesc) introDesc.textContent = `Real-time updates, infrastructure, and community news from ${d.nameEn} district.`;
  if (tickerEl) tickerEl.innerHTML = `<span>BREAKING IN ${d.nameEn.toUpperCase()}: ${d.desc}</span> <b>•</b> <span>Headquarters at ${d.hq} reporting active development.</span>`;
  document.title = `${d.nameEn} District News | YUGANTAR`;
}

function renderDistrictArticles() {
  const target = $('district-articles');
  if (!target) return;

  const term = state.search.trim().toLowerCase();
  const filtered = state.articles.filter(art => {
    const catMatch = state.category === 'all' || art.category === state.category;
    const searchable = `${text(art.title)} ${text(art.summary)} ${art.author || ''}`.toLowerCase();
    return catMatch && (!term || searchable.includes(term));
  });

  const countEl = $('stat-count');
  if (countEl) countEl.textContent = String(filtered.length);

  if (!filtered.length) {
    target.innerHTML = `<div class="empty-state">No stories match this search filter in ${state.districtId} district.</div>`;
    return;
  }

  target.innerHTML = filtered.map(article => `
    <article class="article-card" data-article-id="${escapeHtml(article.id)}">
      <div class="media-frame">
        <img loading="lazy" src="${escapeHtml(article.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80')}" alt="${escapeHtml(text(article.title))}">
      </div>
      <div class="article-body">
        <span class="tag">${escapeHtml(article.category || 'DISTRICT NEWS')}</span>
        <h3>${escapeHtml(text(article.title))}</h3>
        <p>${escapeHtml(text(article.summary))}</p>
        <small>${escapeHtml(article.sourceAgency || 'YUGANTAR Bengal Desk')} · ${escapeHtml(dateText(article.publishedAt))}</small>
      </div>
      <button class="save-article" data-save-id="${escapeHtml(article.id)}" type="button" aria-label="Save story">${isSaved(article.id) ? '★' : '☆'}</button>
    </article>
  `).join('');

  target.querySelectorAll('[data-article-id]').forEach(card => {
    card.addEventListener('click', () => openArticle(card.dataset.articleId));
  });

  target.querySelectorAll('[data-save-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleSaved(btn.dataset.saveId);
    });
  });
}

function toggleSaved(id) {
  const article = state.articles.find(item => item.id === id) || state.saved.find(item => item.id === id);
  if (!article) return;
  state.saved = isSaved(id) ? state.saved.filter(item => item.id !== id) : [article, ...state.saved].slice(0, 50);
  try { localStorage.setItem(savedKey, JSON.stringify(state.saved)); } catch {}
  renderDistrictArticles(); renderSaved();
}

function renderSaved() {
  const count = $('saved-count');
  if (count) count.textContent = String(state.saved.length);
  const target = $('saved-list');
  if (!target) return;
  if (!state.saved.length) { target.innerHTML = `<div class="empty-state">Your saved reading list is empty.</div>`; return; }
  target.innerHTML = state.saved.map(article => `<div class="saved-item"><button class="saved-open" data-open-saved="${escapeHtml(article.id)}" type="button"><strong>${escapeHtml(text(article.title))}</strong><small>${escapeHtml(article.sourceAgency || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></button><button class="saved-remove" data-remove-saved="${escapeHtml(article.id)}" type="button" aria-label="Remove saved article">×</button></div>`).join('');
  target.querySelectorAll('[data-open-saved]').forEach(button => button.addEventListener('click', () => { $('saved-dialog').close(); openArticle(button.dataset.openSaved); }));
  target.querySelectorAll('[data-remove-saved]').forEach(button => button.addEventListener('click', () => {
    state.saved = state.saved.filter(item => item.id !== button.dataset.removeSaved);
    try { localStorage.setItem(savedKey, JSON.stringify(state.saved)); } catch {}
    renderDistrictArticles(); renderSaved();
  }));
}

function openArticle(id) {
  const article = state.articles.find(item => item.id === id) || state.saved.find(item => item.id === id);
  if (!article) return;
  const sourceUrl = safeUrl(article.sourceUrl);
  $('article-detail').innerHTML = `<span class="tag">${escapeHtml(article.category || 'DISTRICT NEWS')}</span><h1>${escapeHtml(text(article.title))}</h1><p class="muted">${escapeHtml(article.author || 'YUGANTAR Bengal Desk')} · ${escapeHtml(dateText(article.publishedAt))}</p><div class="media-frame" style="aspect-ratio:16/9; min-height:220px; border-radius:12px; margin:16px 0;"><img src="${escapeHtml(article.image || '')}" alt="${escapeHtml(text(article.title))}"></div><div class="article-actions"><button class="button" data-dialog-save="${escapeHtml(article.id)}" type="button">${isSaved(article.id) ? '★ Saved' : '☆ Save article'}</button>${sourceUrl ? `<a class="button button-outline" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">View original source</a>` : ''}</div><p class="lead">${escapeHtml(text(article.summary))}</p><div class="article-copy">${escapeHtml(text(article.content) || text(article.summary)).replace(/\n/g, '<br>')}</div>`;
  $('article-detail').querySelector('[data-dialog-save]')?.addEventListener('click', () => toggleSaved(article.id));
  $('article-dialog').showModal();
}

function loadDistrictArticles() {
  state.articles = getDistrictNews(state.districtId, state.firestoreArticles, 10);
  renderDistrictArticles();
}

async function loadFirestoreData() {
  if (!firebaseConfigured) {
    loadDistrictArticles();
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    const result = await getDocs(query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(50)));
    state.firestoreArticles = result.docs.map(item => ({ id: item.id, ...item.data() }));
  } catch (err) {
    console.warn('Firestore load failed for district page; showing an empty district state:', err);
  } finally {
    loadDistrictArticles();
  }
}

function bindUi() {
  state.districtId = getUrlDistrict();
  const storedTheme = (() => { try { return localStorage.getItem('yugantar_theme'); } catch { return null; } })();
  const hour = new Date().getHours();
  setTheme(storedTheme || (hour >= 6 && hour < 18 ? 'light' : 'dark'));

  $('theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('saved-toggle')?.addEventListener('click', () => $('saved-dialog').showModal());
  $('close-saved')?.addEventListener('click', () => $('saved-dialog').close());
  $('close-dialog')?.addEventListener('click', () => $('article-dialog').close());

  const langSelect = $('language');
  if (langSelect) langSelect.value = state.language;
  langSelect?.addEventListener('change', e => {
    state.language = e.target.value;
    try { localStorage.setItem(savedLanguageKey, state.language); } catch {}
    renderDistrictHeader();
    renderDistrictArticles();
    renderSaved();
  });

  $('district-search')?.addEventListener('input', e => {
    state.search = e.target.value;
    renderDistrictArticles();
  });

  document.querySelectorAll('[data-district-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.districtCat;
      document.querySelectorAll('[data-district-cat]').forEach(b => b.classList.toggle('active', b === btn));
      renderDistrictArticles();
    });
  });

  populateDistrictSelect();
  renderDistrictHeader();
  renderMiniWbMap();
  renderSaved();
}

bindUi();
updateClock();
setInterval(updateClock, 1000);
loadFirestoreData();
