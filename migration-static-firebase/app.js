import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  collection, doc, getDocs, getFirestore, limit, onSnapshot, orderBy, query,
  serverTimestamp, addDoc, setDoc, updateDoc, writeBatch, where
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const savedKey = 'yugantar_saved_articles';
const savedLanguageKey = 'yugantar_language';
const getStoredLanguage = () => { try { return localStorage.getItem(savedLanguageKey) || 'EN'; } catch { return 'EN'; } };
const readSaved = () => { try { return JSON.parse(localStorage.getItem(savedKey) || '[]'); } catch { return []; } };
const state = { language: getStoredLanguage(), category: 'all', search: '', articles: [], saved: readSaved(), poll: null };
let db;
const legacyWireNames = new Set(['NDTV National Feed', 'ABP Ananda Bengali Feed', 'BBC Hindi Feed', 'NYT World Feed', 'NYT Technology Feed', 'NYT Business Feed', 'NYT Sports Feed']);

const translations = {
  EN: {
    utilityLive: 'LIVE NEWS NETWORK',
    syncStatus: 'LIVE DATA',
    brandSlogan: 'Truth • Speed • Unbiased Coverage',
    catAll: 'Latest',
    catNational: 'National',
    catWorld: 'World',
    catBusiness: 'Business',
    catSports: 'Sports',
    catTech: 'Tech',
    catEntertainment: 'Entertainment',
    tickerBreaking: 'BREAKING',
    liveTvKicker: 'LIVE TV',
    liveTvTitle: 'Live channel',
    liveTvMeta: 'The editorial desk can change the stream URL without redeploying the frontend.',
    liveTvAction: 'Open live coverage',
    inFocusKicker: 'IN FOCUS',
    inFocusTitle: 'Top developments',
    newsroomKicker: 'NEWSROOM',
    newsroomTitle: 'Latest stories',
    newsroomIntro: 'Independent reporting, refreshed from the newsroom and trusted public feeds.',
    searchPlaceholder: 'Search stories',
    socialKicker: 'OFFICIAL SOCIAL',
    socialTitle: 'From YUGANTAR channels',
    watchAllVideos: 'Watch all videos',
    opinionKicker: 'OPINION',
    newsletterKicker: 'NEWSLETTER',
    newsletterTitle: 'Get the daily bulletin',
    newsletterMuted: 'Top stories, live updates, and newsroom briefs delivered to your inbox.',
    subscribePlaceholder: 'you@example.com',
    subscribeBtn: 'Subscribe',
    readingListKicker: 'YOUR READING LIST',
    savedTitle: 'Saved articles',
    footerAbout: 'Delivering unbiased 24x7 breaking news, real-time video streaming, in-depth editorials, and financial intelligence globally.',
    footerMotto: '“নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা।”',
    footerLiveLink: '● YUGANTAR LIVE 24/7',
    footerOfficialDesk: 'Official desk',
    footerNewsSections: 'News sections',
    footerConnectTitle: 'Connect with us',
    footerConnectText: 'Follow official channels for verified breaking updates.',
    footerSecTop: 'Top stories',
    footerSecNational: 'National',
    footerSecWorld: 'World',
    footerSecBusiness: 'Business & finance',
    footerSecTech: 'Tech & AI',
    footerSecSports: 'Sports',
    footerCopyright: '© 2026 Yugantar News Network. All rights reserved.',
    footerFactCheck: '✦ Fact-checked newsroom',
    emptyArticles: 'No published stories match this view.',
    emptySaved: 'Your saved reading list is empty.',
    saveArticle: '☆ Save article',
    savedArticle: '★ Saved',
    viewSource: 'View original source'
  },
  BN: {
    utilityLive: 'লাইভ নিউজ নেটওয়ার্ক',
    syncStatus: 'লাইভ ডাটা',
    brandSlogan: 'সত্য • দ্রুততা • নিরপেক্ষ সংবাদ',
    catAll: 'সর্বশেষ',
    catNational: 'জাতীয়',
    catWorld: 'আন্তর্জাতিক',
    catBusiness: 'বাণিজ্য',
    catSports: 'খেলাধুলা',
    catTech: 'প্রযুক্তি',
    catEntertainment: 'বিনোদন',
    tickerBreaking: 'ব্রেকিং নিউজ',
    liveTvKicker: 'লাইভ টিভি',
    liveTvTitle: 'লাইভ চ্যানেল',
    liveTvMeta: 'সম্পাদকীয় ডেস্ক সরাসরি লাইভ স্ট্রিম আপডেট করতে পারে।',
    liveTvAction: 'লাইভ কভারেজ খুলুন',
    inFocusKicker: 'বিশেষ সংবাদ',
    inFocusTitle: 'প্রধান খবর',
    newsroomKicker: 'নিউজ রুম',
    newsroomTitle: 'সর্বশেষ খবর',
    newsroomIntro: 'স্বাধীন সাংবাদিকতা, নিউজ রুম ও নির্ভরযোগ্য সূত্র থেকে নিয়মিত আপডেট।',
    searchPlaceholder: 'খবর খুঁজুন...',
    socialKicker: 'অফিসিয়াল সোশ্যাল',
    socialTitle: 'যুগান্তর চ্যানেল থেকে',
    watchAllVideos: 'সমস্ত ভিডিও দেখুন',
    opinionKicker: 'জনমত',
    newsletterKicker: 'নিউজলেটার',
    newsletterTitle: 'দৈনিক বুলেটিন পান',
    newsletterMuted: 'প্রধান খবর, লাইভ আপডেট এবং ইনবক্সে গুরুত্বপূর্ণ খবর পান।',
    subscribePlaceholder: 'আপনার ইমেইল ঠিকানা...',
    subscribeBtn: 'সাবস্ক্রাইব করুন',
    readingListKicker: 'আপনার পঠন তালিকা',
    savedTitle: 'সেভ করা খবর',
    footerAbout: 'বিশ্বজুড়ে ২৪x৭ নিরপেক্ষ ব্রেকিং নিউজ, রিয়েল-টাইম ভিডিও স্ট্রিমিং এবং বিস্তারিত সম্পাদকীয় পরিবেশন।',
    footerMotto: '“নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা।”',
    footerLiveLink: '● যুগান্তর লাইভ ২৪/৭',
    footerOfficialDesk: 'অফিসিয়াল ডেস্ক',
    footerNewsSections: 'সংবাদ বিভাগ',
    footerConnectTitle: 'আমাদের সাথে যুক্ত থাকুন',
    footerConnectText: 'সঠিক ও যাচাইকৃত সংবাদের জন্য অফিশিয়াল চ্যানেল ফলো করুন।',
    footerSecTop: 'প্রধান খবর',
    footerSecNational: 'জাতীয়',
    footerSecWorld: 'আন্তর্জাতিক',
    footerSecBusiness: 'ব্যবসা ও অর্থ',
    footerSecTech: 'প্রযুক্তি ও এআই',
    footerSecSports: 'খেলাধুলা',
    footerCopyright: '© ২০২৬ যুগান্তর নিউজ নেটওয়ার্ক। সর্বস্বত্ব সংরক্ষিত।',
    footerFactCheck: '✦ সত্যতা যাচাইকৃত নিউজ রুম',
    emptyArticles: 'এই বিভাগে কোনো খবর প্রকাশিত হয়নি।',
    emptySaved: 'আপনার সেভ করা খবরের তালিকা খালি।',
    saveArticle: '☆ সেভ করুন',
    savedArticle: '★ সেভ করা হয়েছে',
    viewSource: 'মূল উৎস দেখুন'
  },
  HI: {
    utilityLive: 'लाइव न्यूज नेटवर्क',
    syncStatus: 'लाइव डेटा',
    brandSlogan: 'सत्य • गति • निष्पक्ष समाचार',
    catAll: 'नवीनतम',
    catNational: 'राष्ट्रीय',
    catWorld: 'दुनिया',
    catBusiness: 'व्यापार',
    catSports: 'खेल',
    catTech: 'टेक',
    catEntertainment: 'मनोरंजन',
    tickerBreaking: 'ब्रेकिंग न्यूज़',
    liveTvKicker: 'लाइव टीवी',
    liveTvTitle: 'लाइव चैनल',
    liveTvMeta: 'संपादकीय डेस्क स्ट्रीम यूआरएल को सीधे अपडेट कर सकता है।',
    liveTvAction: 'लाइव कवरेज खोलें',
    inFocusKicker: 'इन फोकस',
    inFocusTitle: 'मुख्य समाचार',
    newsroomKicker: 'न्यूज़रूम',
    newsroomTitle: 'ताज़ा ख़बरें',
    newsroomIntro: 'स्वतंत्र रिपोर्टिंग, न्यूज़रूम और विश्वसनीय स्रोतों से अपडेट।',
    searchPlaceholder: 'समाचार खोजें...',
    socialKicker: 'आधिकारिक सोशल',
    socialTitle: 'युगांतर चैनल से',
    watchAllVideos: 'सभी वीडियो देखें',
    opinionKicker: 'ओपिनियन',
    newsletterKicker: 'न्यूज़लेटर',
    newsletterTitle: 'दैनिक बुलेटिन प्राप्त करें',
    newsletterMuted: 'मुख्य समाचार, लाइव अपडेट और न्यूज़रूम ब्रीफ सीधे इनबॉक्स में पाएं।',
    subscribePlaceholder: 'आपका ईमेल...',
    subscribeBtn: 'सब्सक्राइब करें',
    readingListKicker: 'आपकी रीडिंग लिस्ट',
    savedTitle: 'सेव किए गए समाचार',
    footerAbout: 'दुनिया भर में 24x7 निष्पक्ष ब्रेकिंग न्यूज़, लाइव वीडियो स्ट्रीमिंग और विस्तृत संपादकीय।',
    footerMotto: '“निरपेक्ष खबर, निर्भीक पत्रकारिता।”',
    footerLiveLink: '● युगांतर लाइव 24/7',
    footerOfficialDesk: 'आधिकारिक डेस्क',
    footerNewsSections: 'समाचार अनुभाग',
    footerConnectTitle: 'हमसे जुड़ें',
    footerConnectText: 'सत्यापित ब्रेकिंग अपडेट के लिए आधिकारिक चैनल फॉलो करें।',
    footerSecTop: 'मुख्य समाचार',
    footerSecNational: 'राष्ट्रीय',
    footerSecWorld: 'दुनिया',
    footerSecBusiness: 'व्यापार और वित्त',
    footerSecTech: 'टेक और एआई',
    footerSecSports: 'खेल',
    footerCopyright: '© 2026 युगांतर न्यूज़ नेटवर्क। सर्वाधिकार सुरक्षित।',
    footerFactCheck: '✦ फ़ैक्ट-चेक्ड न्यूज़रूम',
    emptyArticles: 'इस श्रेणी में कोई समाचार उपलब्ध नहीं है।',
    emptySaved: 'आपकी सेव की गई सूची खाली है।',
    saveArticle: '☆ सेव करें',
    savedArticle: '★ सेव किया गया',
    viewSource: 'मूल स्रोत देखें'
  }
};

function updateStaticLanguage(lang = state.language) {
  const dict = translations[lang] || translations.EN;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      const icon = el.querySelector('i');
      if (icon) {
        el.textContent = ' ' + dict[key];
        el.prepend(icon);
      } else {
        el.textContent = dict[key];
      }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });
}

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

const sunIconSvg = `<svg class="theme-icon-svg sun-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const moonIconSvg = `<svg class="theme-icon-svg moon-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>`;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $('theme-toggle');
  if (toggle) {
    toggle.innerHTML = theme === 'dark' ? moonIconSvg : sunIconSvg;
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
  const dict = translations[state.language] || translations.EN;
  if (!state.saved.length) { target.innerHTML = `<div class="empty-state">${escapeHtml(dict.emptySaved)}</div>`; return; }
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
  if (target) target.textContent = new Intl.DateTimeFormat(state.language === 'BN' ? 'bn-BD' : (state.language === 'HI' ? 'hi-IN' : undefined), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
}

function renderArticles() {
  const target = $('articles');
  const term = state.search.trim().toLowerCase();
  const dict = translations[state.language] || translations.EN;
  const articles = state.articles.filter(article => !legacyWireNames.has(article.sourceAgency) && article.sourceType !== 'wire').filter(article => {
    const categoryMatch = state.category === 'all' || article.category === state.category;
    const searchable = `${text(article.title)} ${text(article.summary)} ${article.author || ''} ${article.sourceAgency || ''}`.toLowerCase();
    return categoryMatch && (!term || searchable.includes(term));
  });
  if (!articles.length) { target.innerHTML = `<div class="empty-state">${escapeHtml(dict.emptyArticles)}</div>`; return; }
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
  const dict = translations[state.language] || translations.EN;
  $('article-detail').innerHTML = `<span class="tag">${escapeHtml(article.category || 'NEWS')}</span><h1>${escapeHtml(text(article.title))}</h1><p class="muted">${escapeHtml(article.author || 'YUGANTAR Editorial')} · ${escapeHtml(dateText(article.publishedAt))}</p>${imageMarkup(article.image, text(article.title), 'YUGANTAR')}<div class="article-actions"><button class="button" data-dialog-save="${escapeHtml(article.id)}" type="button">${isSaved(article.id) ? dict.savedArticle : dict.saveArticle}</button>${sourceUrl ? `<a class="button button-outline" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(dict.viewSource)}</a>` : ''}</div><p class="lead">${escapeHtml(text(article.summary))}</p><div class="article-copy">${escapeHtml(text(article.content) || text(article.summary)).replace(/\n/g, '<br>')}</div>`;
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

function renderVideos(snapshot) {
  let itemsToRender = Array.isArray(snapshot) && snapshot.length > 0 ? snapshot : [];
  if (itemsToRender.length < 6) {
    const existing = new Set(itemsToRender.map(item => item.id || item.videoUrl));
    const fill = DEFAULT_DEMO_VIDEOS.filter(item => !existing.has(item.id) && !existing.has(item.videoUrl));
    itemsToRender = [...itemsToRender, ...fill];
  }
  itemsToRender = itemsToRender.slice(0, 6);
  const videos = itemsToRender.map(item => {
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
  const pollPanelEl = document.querySelector('.poll-panel') || $('poll-question')?.closest('.panel');
  if (!poll) { 
    $('poll-question').textContent = 'No active poll'; 
    $('poll-options').innerHTML = '<p class="muted" style="margin: 6px 0 0; font-size: 0.82rem;">Check back soon for new audience polls.</p>';
    if (pollPanelEl) pollPanelEl.classList.add('no-poll');
    return; 
  }
  if (pollPanelEl) pollPanelEl.classList.remove('no-poll');
  $('poll-question').textContent = text(poll.question);
  const counts = { ...Object.fromEntries((poll.options || []).map(option => [option.optionId, 0])), ...(poll.voteCounts || {}) }; poll.voteCounts = counts; const total = Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0); const selected = poll.userOption || '';
  const pollOptionsEl = $('poll-options');
  const optionCount = (poll.options || []).length;
  pollOptionsEl.className = `poll-options-grid ${
    optionCount === 2 ? 'poll-options-2' :
    optionCount === 3 ? 'poll-options-3' :
    optionCount === 4 ? 'poll-options-4' : 'poll-options-many'
  }`;
  pollOptionsEl.innerHTML = (poll.options || []).map(option => { const count = Number(counts[option.optionId] || 0); const percentage = total ? Math.round((count / total) * 100) : 0; return `<button class="poll-option${selected === option.optionId ? ' selected' : ''}" data-option-id="${escapeHtml(option.optionId)}" type="button"><span class="poll-option-row"><strong>${escapeHtml(text(option.text))}</strong><span>${percentage}%</span></span><span class="poll-result-track"><span style="width:${percentage}%"></span></span></button>`; }).join('');
  pollOptionsEl.querySelectorAll('[data-option-id]').forEach(button => button.addEventListener('click', () => votePoll(button.dataset.optionId)));
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
  const videos = await getDocs(query(collection(db, 'videoItems'), where('active', '==', true), orderBy('publishedAt', 'desc'), limit(6))).catch(() => ({ docs: [] }));
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
  const hour = new Date().getHours();
  const defaultTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
  setTheme(storedTheme || defaultTheme);
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('saved-toggle').addEventListener('click', () => $('saved-dialog').showModal());
  $('close-saved').addEventListener('click', () => $('saved-dialog').close());
  const langSelect = $('language');
  if (langSelect) langSelect.value = state.language;
  updateStaticLanguage(state.language);
  renderSaved();
  langSelect?.addEventListener('change', event => {
    state.language = event.target.value;
    try { localStorage.setItem(savedLanguageKey, state.language); } catch {}
    updateStaticLanguage(state.language);
    renderArticles();
    renderHero();
    renderHeadlineStrip();
    renderSaved();
    if (state.poll) renderPoll(state.poll);
  });
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
setInterval(updateClock, 1000);
if (!firebaseConfigured) showSetupMessage();
else {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  $('sync-status').textContent = 'LIVE DATA';
  startRealtimeListeners(); loadArticles(); loadVideosAndPoll();
}
