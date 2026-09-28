import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  collection, doc, getDocs, getFirestore, limit, onSnapshot, orderBy, query,
  serverTimestamp, addDoc, setDoc, updateDoc, writeBatch, where
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS, WB_REGIONS, WB_MAP_VIEWBOX } from './wb-map-data.js';
import { SPONSORS } from './sponsors-data.js';

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

const DEFAULT_DEMO_ARTICLES = [
  {
    id: 'demo-art-1',
    hero: true,
    breaking: true,
    category: 'national',
    title: {
      EN: 'California Supreme Court orders Riverside County Sheriff Bianco to return 650,000 seized ballots',
      BN: 'ক্যালিফোর্নিয়ার সুপ্রিম কোর্টের গুরুত্বপূর্ণ রায়: ৬,৫০,০০০ ব্যালাট অবিলম্বে ফেরতের নির্দেশ',
      HI: 'कैलिफोर्निया सुप्रीम कोर्ट का बड़ा आदेश: 6,50,000 जब्त मतपत्र तुरंत वापस किए जाएं'
    },
    summary: {
      EN: 'The state supreme court issued an emergency injunction ordering the immediate return of seized ballots in the county election oversight probe.',
      BN: 'কাউন্টি নির্বাচন তদারকি তদন্তে রাজ্য সুপ্রিম কোর্ট বাজেয়াপ্ত ব্যালাট অবিলম্বে ফেরতের জরুরি নির্দেশ জারি করেছে।',
      HI: 'राज्य के सर्वोच्च न्यायालय ने काउंटी चुनाव जांच में जब्त मतपत्रों की तत्काल वापसी का आदेश जारी किया।'
    },
    author: 'YUGANTAR Desk',
    sourceAgency: 'YUGANTAR News',
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'demo-art-2',
    category: 'world',
    title: {
      EN: 'South-East Asia Travel News, Guides, Ideas & Tips',
      BN: 'দক্ষিণ-পূর্ব এশিয়া ভ্রমণ সংবাদ, গাইড ও গুরুত্বপূর্ণ টিপস',
      HI: 'दक्षिण-पूर्व एशिया यात्रा समाचार, गाइड और प्रमुख टिप्स'
    },
    summary: {
      EN: 'Comprehensive guide to exploring tropical heritage sites, island corridors, and cultural hubs across South-East Asia.',
      BN: 'দক্ষিণ-পূর্ব এশিয়ার ঐতিহাসিক ঐতিহ্য, দ্বীপ করিডোর ও সাংস্কৃতিক কেন্দ্র ভ্রমণের পূর্ণাঙ্গ গাইড।',
      HI: 'दक्षिण-पूर्व एशिया के ऐतिहासिक धरोहरों, द्वीप गलियारों और सांस्कृतिक केंद्रों का विस्तृत गाइड।'
    },
    author: 'Traveller Desk',
    sourceAgency: 'YUGANTAR Global',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'demo-art-3',
    category: 'tech',
    title: {
      EN: 'Summit Discussion: Solera, BYD, and CITS Chart the Future of EV Mobility',
      BN: 'সামিট আলোচনা: ইভি মোবিলিটি ও গ্রিন অটোমোটিভ প্রযুক্তির নতুন ভবিষ্যৎ',
      HI: 'शिखर सम्मेलन: ईवी मोबिलिटी और ग्रीन ऑटोमोटिव तकनीक का नया भविष्य'
    },
    summary: {
      EN: 'Industry leaders convene at global summit to outline next-generation electric mobility, battery grids, and autonomous fleet management.',
      BN: 'গ্লোবাল সামিটে বৈদ্যুতিক গতিশীলতা, ব্যাটারি গ্রিড ও স্বায়ত্তশাসিত যান ব্যবস্থাপনার রূপরেখা তৈরি।',
      HI: 'ग्लोबल समिट में इलेक्ट्रिक मोबिलिटी, बैटरी ग्रिड और स्वायत्त वाहन प्रबंधन की रूपरेखा तैयार।'
    },
    author: 'Tech Bureau',
    sourceAgency: 'YUGANTAR Tech',
    image: 'https://images.unsplash.com/photo-1558441719-aa3496743f88?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'demo-art-4',
    category: 'national',
    title: {
      EN: 'Boy dies in hospital after being shot in the face during altercation',
      BN: 'বিবাদের জেরে গুলিবদ্ধ তরুণের হাসপাতালে মৃত্যু, এলাকায় তীব্র চাঞ্চল্য',
      HI: 'विवाद के दौरान गोली लगने से अस्पताल में युवक की मौत, इलाके में तनाव'
    },
    summary: {
      EN: 'Police launch full investigation into the fatal incident as local community demands strict safety enforcement and forensic analysis.',
      BN: 'ঘাতক ঘটনার তদন্তে নেমেছে পুলিশ, এলাকায় নিরাপত্তা জোরদার ও ফরেনসিক দল মোতায়েন।',
      HI: 'पुलिस ने घातक घटना की गहन जांच शुरू की, क्षेत्र में सुरक्षा बढ़ाई गई और फोरेंसिक जांच जारी।'
    },
    author: 'Crime Desk',
    sourceAgency: 'YUGANTAR News',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'demo-art-5',
    category: 'sports',
    title: {
      EN: 'NAMI Walks Rome this weekend for Mental Health Awareness',
      BN: 'মানসিক স্বাস্থ্য সচেতনতায় এই সপ্তাহান্তে বিশেষ হাঁটা কর্মসূচি',
      HI: 'मानसिक स्वास्थ्य जागरूकता के लिए इस सप्ताहांत विशेष वॉक का आयोजन'
    },
    summary: {
      EN: 'Thousands of participants gather to advocate for accessible healthcare, community wellness, and mental resilience programs.',
      BN: 'সহলভ্য স্বাস্থ্যসেবা, সামাজিক কল্যাণ ও মানসিক সহনশীলতা গড়ে তুলতে হাজারো মানুষের অংশগ্রহণ।',
      HI: 'सुलभ स्वास्थ्य सेवा, सामाजिक कल्याण और मानसिक मजबूती के लिए हजारों लोग एकजुट हुए।'
    },
    author: 'Health Desk',
    sourceAgency: 'YUGANTAR Life',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 'demo-art-6',
    category: 'business',
    title: {
      EN: 'Global Stock Markets Rally as Central Banks Announce Economic Growth Measures',
      BN: 'বিশ্ব শেয়ার বাজারে চাঙ্গা ভাব, কেন্দ্রীয় ব্যাংকের অর্থনৈতিক বৃদ্ধির নতুন বার্তা',
      HI: 'वैश्विक शेयर बाजारों में तेजी, केंद्रीय बैंकों ने दिए आर्थिक विकास के संकेत'
    },
    summary: {
      EN: 'Benchmark indices hit multi-month highs following positive manufacturing output data and lower inflation projections across key markets.',
      BN: 'উৎপাদন বৃদ্ধি এবং মূল্যস্ফীতি কমার তথ্যের পর প্রধান অর্থনৈতিক সূচকগুলিতে ব্যাপক উন্নতি।',
      HI: 'विनिर्माण डेटा में सुधार और मुद्रास्फीति में कमी के चलते शेयर बाजारों में रिकॉर्ड बढ़त।'
    },
    author: 'Finance Bureau',
    sourceAgency: 'YUGANTAR Business',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

const DEFAULT_DEMO_VIDEOS = [
  { id: 'v-1', title: '🔴 SahiDon Is Live | PUBG MOBILE Kr | Noob Is Back 🤠', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream PUBG MOBILE on Omlet Arcade! Follow me for more: https://omlet.gg/d/profile/sahidongamingyt...', publishedAt: '1/26/2021, 1:12:10 PM' },
  { id: 'v-2', title: 'Thank You Guys For 600 SUBS & Support 🔥', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Thank you guys for 600 subs & support! Keep supporting!', publishedAt: '8/31/2020, 7:39:50 PM' },
  { id: 'v-3', title: 'Crafting Smithy 🛠️ & Metal Tools Unlocked! | ARK Survival', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream ARK: Survival Evolved on Omlet Arcade!', publishedAt: '11/20/2020, 7:41:21 PM' },
  { id: 'v-4', title: 'Watch me stream PUBG MOBILE on Omlet Arcade!', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Watch me stream PUBG MOBILE on Omlet Arcade!', publishedAt: '1/23/2021, 12:06:12 PM' },
  { id: 'v-5', title: 'SahiDon Gaming Live Stream Highlights', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Official livestream highlights and clutch moments.', publishedAt: '1/21/2021, 9:52:51 AM' },
  { id: 'v-6', title: '🔴 This Match Took Me From Ace To Conqueror 🏆', provider: 'youtube', mediaType: 'video', videoUrl: 'https://www.youtube.com/watch?v=live_stream', description: 'Insane Conqueror lobby push with top tier gameplay.', publishedAt: '8/27/2020, 7:12:48 PM' }
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
    const docs = result.docs.map(item => ({ id: item.id, ...item.data() }));
    state.articles = docs.length ? docs : DEFAULT_DEMO_ARTICLES;
  } catch (error) {
    console.warn('Articles query failed, loading default newsroom articles:', error);
    state.articles = DEFAULT_DEMO_ARTICLES;
  } finally {
    renderArticles(); renderHero(); renderHeadlineStrip();
  }
}

function startRealtimeListeners() {
  onSnapshot(query(collection(db, 'tickers'), where('active', '==', true), orderBy('priority', 'asc'), limit(20)), snapshot => {
    const items = snapshot.docs.map(item => item.data());
    $('ticker-items').innerHTML = items.length ? items.map(item => `<span>${escapeHtml(text(item.title))}</span>`).join(' <b>•</b> ') : 'No active breaking updates.';
  }, () => { $('ticker-items').textContent = 'California Supreme Court orders Riverside County Sheriff Bianco to return 650,000 seized ballots • South-East Asia Travel News & Guides • Summit Discussion: Solera, BYD, and CITS Chart EV Mobility Future.'; });
  onSnapshot(query(collection(db, 'liveStreams'), where('active', '==', true), limit(1)), snapshot => {
    const stream = snapshot.docs[0]?.data();
    $('live-title').textContent = stream?.title || 'Live channel';
    $('live-meta').textContent = stream?.provider ? `${stream.provider} · Updated ${dateText(stream.updatedAt)}` : 'The editorial desk can change the stream URL without redeploying the frontend.';
    const youtubeVideoId = youtubeId(stream?.videoUrl);
    const streamUrl = safeUrl(stream?.videoUrl);
    $('live-player').innerHTML = youtubeVideoId ? youtubeEmbed(youtubeVideoId) : (stream?.provider === 'facebook' && streamUrl ? facebookEmbed(streamUrl) : (streamUrl ? `<a class="button" href="${escapeHtml(streamUrl)}" target="_blank" rel="noreferrer">Open live stream</a>` : 'No live stream configured.'));
    if (window.FB) window.FB.XFBML.parse($('live-player'));
    const action = $('live-action');
    if (action && streamUrl) { action.href = streamUrl; action.classList.remove('hidden'); } else if (action) action.classList.add('hidden');
  });
}

async function loadVideosAndPoll() {
  let videoItems = [];
  try {
    const videos = await getDocs(query(collection(db, 'videoItems'), where('active', '==', true), orderBy('publishedAt', 'desc'), limit(6)));
    videoItems = videos.docs.map(item => item.data());
  } catch (err) {
    console.warn('Videos load using channel videos:', err);
  }
  renderVideos(videoItems);

  try {
    const polls = await getDocs(query(collection(db, 'polls'), where('active', '==', true), limit(1)));
    renderPoll(polls.docs[0] ? { id: polls.docs[0].id, ...polls.docs[0].data() } : null);
  } catch (err) {
    renderPoll(null);
  }
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
  $('close-sponsor-dialog')?.addEventListener('click', () => $('sponsor-dialog').close());

  // Sponsors Sidebar setup
  renderSponsors('all');
  document.querySelectorAll('[data-sponsor-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sponsor-cat]').forEach(b => b.classList.toggle('active', b === btn));
      renderSponsors(btn.dataset.sponsorCat);
    });
  });

  $('become-sponsor-btn')?.addEventListener('click', () => {
    openSponsorModal(SPONSORS[0].id);
  });

  // Header Modals (Subscribers & Careers)
  setupHeaderModals();

  // West Bengal Interactive Map setup
  renderWestBengalMap();
  renderDistrictList();

  $('wb-district-search')?.addEventListener('input', e => {
    renderDistrictList(e.target.value);
  });

  // Mobile edge bar toggles
  $('mobile-sponsors-toggle')?.addEventListener('click', () => {
    $('sponsors-sidebar')?.scrollIntoView({ behavior: 'smooth' });
  });
  $('mobile-wbmap-toggle')?.addEventListener('click', () => {
    $('wb-map-sidebar')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function setupHeaderModals() {
  const subBtn = $('subscribers-btn');
  const subDialog = $('subscribers-dialog');
  const closeSubDialog = $('close-subscribers-dialog');
  const subForm = $('subscriber-form');
  const subMsg = $('sub-success-msg');

  const jobsBtn = $('jobs-btn');
  const jobsDialog = $('jobs-dialog');
  const closeJobsDialog = $('close-jobs-dialog');
  const jobForm = $('job-application-form');
  const jobMsg = $('job-success-msg');

  let subCount = 254820;
  try {
    const storedCount = localStorage.getItem('yugantar_sub_count');
    if (storedCount) subCount = parseInt(storedCount, 10);
  } catch {}

  const updateSubDisplay = () => {
    const formattedK = (subCount / 1000).toFixed(1) + 'K';
    const headerEl = $('header-sub-count');
    const modalEl = $('modal-sub-count');
    if (headerEl) headerEl.textContent = formattedK;
    if (modalEl) modalEl.textContent = subCount.toLocaleString();
  };

  updateSubDisplay();

  subBtn?.addEventListener('click', () => {
    subDialog?.showModal();
  });

  closeSubDialog?.addEventListener('click', () => {
    subDialog?.close();
  });

  subForm?.addEventListener('submit', e => {
    e.preventDefault();
    subCount += 1;
    try { localStorage.setItem('yugantar_sub_count', String(subCount)); } catch {}
    updateSubDisplay();
    if (subMsg) subMsg.classList.remove('hidden');
    setTimeout(() => {
      subMsg?.classList.add('hidden');
      subForm.reset();
      subDialog?.close();
    }, 2000);
  });

  jobsBtn?.addEventListener('click', () => {
    jobsDialog?.showModal();
  });

  closeJobsDialog?.addEventListener('click', () => {
    jobsDialog?.close();
  });

  document.querySelectorAll('.apply-btn-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const jobTitle = btn.dataset.jobTitle;
      const selectEl = $('job-position');
      if (selectEl && jobTitle) selectEl.value = jobTitle;
      const formEl = $('job-application-form');
      formEl?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  jobForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (jobMsg) jobMsg.classList.remove('hidden');
    setTimeout(() => {
      jobMsg?.classList.add('hidden');
      jobForm.reset();
      jobsDialog?.close();
    }, 2500);
  });
}

function renderSponsors(category = 'all') {
  const container = $('sponsors-animated-box');
  if (!container) return;
  const filtered = category === 'all' ? SPONSORS : SPONSORS.filter(s => s.category === category);
  
  if (!filtered || !filtered.length) {
    container.innerHTML = `
      <div class="sponsor-empty-card">
        <span class="empty-icon">📢</span>
        <strong>No Active Sponsors</strong>
        <p>Sponsor partner banners will automatically display here once assigned.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(sp => `
    <div class="sponsor-card" style="--bannerBg: ${sp.bannerBg || 'linear-gradient(135deg, #091526, #d92535)'};" data-sponsor-id="${sp.id}" title="Click to view sponsor details">
      <span class="sponsor-badge">${escapeHtml(sp.badge || 'PARTNER')}</span>
      <div class="sponsor-top-row">
        <div class="sponsor-logo-box">
          ${sp.logo ? `<img src="${escapeHtml(sp.logo)}" alt="${escapeHtml(sp.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span class="sponsor-logo-fallback" style="display:none;">${sp.fallbackIcon || '🏢'}</span>` : `<span class="sponsor-logo-fallback">${sp.fallbackIcon || '🏢'}</span>`}
        </div>
        <div class="sponsor-info">
          <strong>${escapeHtml(sp.name)}</strong>
          <small>${escapeHtml(sp.tagline)}</small>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-sponsor-id]').forEach(card => {
    card.addEventListener('click', () => openSponsorModal(card.dataset.sponsorId));
  });
}

function openSponsorModal(sponsorId) {
  const sponsor = SPONSORS.find(s => s.id === sponsorId);
  const content = $('sponsor-modal-content');
  if (!content) return;
  
  if (!sponsor) {
    content.innerHTML = `
      <span class="tag">SPONSORSHIP OPPORTUNITY</span>
      <h1 style="margin:8px 0 4px; color:var(--ink);">Become a Sponsor Partner</h1>
      <p class="muted" style="margin-bottom:14px; font-weight:700;">Partner with YUGANTAR News Network</p>
      <div style="padding:20px; border-radius:12px; background:linear-gradient(135deg, #091526, #d92535); color:#fff; margin-bottom:16px;">
        <p style="margin:0; font-size:1.02rem; line-height:1.45;">Reach millions of viewers across West Bengal and globally. Showcase your animated partner banner on our live 24x7 news platform.</p>
      </div>
      <div class="article-actions">
        <a class="button" href="mailto:office.yugantarnews@gmail.com?subject=Sponsorship%20Inquiry%20Yugantar%20News">Contact Editorial Desk ✉</a>
        <a class="button button-outline" href="tel:+918479084770">Call Desk ☎</a>
      </div>
    `;
    $('sponsor-dialog')?.showModal();
    return;
  }

  content.innerHTML = `
    <span class="tag">${escapeHtml(sponsor.badge)}</span>
    <h1 style="margin:8px 0 4px; color:var(--ink);">${escapeHtml(sponsor.name)}</h1>
    <p class="muted" style="margin-bottom:14px; font-weight:700;">${escapeHtml(sponsor.tagline)}</p>
    <div style="padding:20px; border-radius:12px; background:${sponsor.bannerBg}; color:#fff; margin-bottom:16px;">
      <p style="margin:0; font-size:1.05rem; line-height:1.4;">${escapeHtml(sponsor.description)}</p>
    </div>
    <div class="article-actions">
      <a class="button" href="${escapeHtml(sponsor.website)}" target="_blank" rel="noopener noreferrer">Visit Official Site ↗</a>
      <a class="button button-outline" href="mailto:office.yugantarnews@gmail.com?subject=Sponsorship%20Inquiry">Partner With Us ✉</a>
    </div>
  `;
  $('sponsor-dialog')?.showModal();
}

let selectedRegion = 'all';

function renderWestBengalMap(filterRegion = 'all') {
  const container = $('wb-interactive-map-container');
  if (!container) return;

  const regionPills = WB_REGIONS.map(r => `
    <button class="region-pill ${r.id === filterRegion ? 'active' : ''}" data-region-id="${r.id}">
      ${r.name}
    </button>
  `).join('');

  const clipDefs = `
    <defs>
      <clipPath id="clip-paschim-medinipur">
        <polygon points="200,840 342,840 332,975 200,975" />
      </clipPath>
      <clipPath id="clip-purba-medinipur">
        <polygon points="342,840 430,840 430,975 332,975" />
      </clipPath>
      <clipPath id="clip-north-24-parganas">
        <polygon points="470,780 640,780 640,918 470,918" />
      </clipPath>
      <clipPath id="clip-south-24-parganas">
        <polygon points="470,918 640,918 640,1030 470,1030" />
      </clipPath>
    </defs>
  `;

  // Order urban / overlapping districts so Kolkata, Howrah, Hooghly sit on top and remain 100% clickable
  const sortedDistricts = [...WB_DISTRICTS].sort((a, b) => {
    const topOrder = { 'hooghly': 1, 'howrah': 2, 'kolkata': 3 };
    return (topOrder[a.id] || 0) - (topOrder[b.id] || 0);
  });

  const svgPaths = sortedDistricts.map(d => {
    const isMatchedRegion = filterRegion === 'all' || d.region === filterRegion;
    const pathFill = isMatchedRegion ? d.color : 'rgba(203, 213, 225, 0.4)';
    const pathOpacity = isMatchedRegion ? '1' : '0.4';
    const lines = d.labelLines || [d.shortName || d.nameEn];
    const startY = d.labelPos.y - (lines.length > 1 ? (lines.length - 1) * 7 : 0);
    const tspans = lines.map((line, idx) => `<tspan x="${d.labelPos.x}" dy="${idx === 0 ? 0 : 14}">${escapeHtml(line)}</tspan>`).join('');

    let clipAttr = '';
    if (d.id === 'paschim-medinipur') clipAttr = ' clip-path="url(#clip-paschim-medinipur)"';
    else if (d.id === 'purba-medinipur') clipAttr = ' clip-path="url(#clip-purba-medinipur)"';
    else if (d.id === 'north-24-parganas') clipAttr = ' clip-path="url(#clip-north-24-parganas)"';
    else if (d.id === 'south-24-parganas') clipAttr = ' clip-path="url(#clip-south-24-parganas)"';

    return `
      <g class="wb-district-group">
        <path d="${d.svgPath}"${clipAttr} fill="${pathFill}" stroke="#334155" stroke-width="1.2" opacity="${pathOpacity}" class="wb-district-path" data-district-id="${d.id}" data-district-name="${escapeHtml(d.nameEn)}" data-district-bn="${escapeHtml(d.nameBn)}" data-district-region="${escapeHtml(d.region)}" data-district-hq="${escapeHtml(d.hq)}">
          <title>${d.nameEn} (${d.nameBn}) - HQ: ${d.hq} (${d.region})</title>
        </path>
        <text x="${d.labelPos.x}" y="${startY}" fill="#0f172a" font-size="12.5" font-weight="700" pointer-events="none" text-anchor="middle" opacity="${pathOpacity}" style="font-family: system-ui, -apple-system, sans-serif; text-shadow: 0 0 3px #ffffff, 0 0 3px #ffffff;">${tspans}</text>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <div class="wb-map-region-filter">
      ${regionPills}
    </div>
    <div class="wb-map-svg-wrapper">
      <svg viewBox="${WB_MAP_VIEWBOX}" width="100%" class="wb-svg-main">
        ${clipDefs}
        <g>${svgPaths}</g>
      </svg>
      <div id="wb-district-tooltip" class="wb-district-tooltip hidden">
        <strong id="tooltip-title">Kolkata</strong>
        <span id="tooltip-bn">কলকাতা</span>
        <small id="tooltip-meta">HQ: Kolkata · South Bengal</small>
        <div class="tooltip-action">Click to open District News →</div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-region-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRegion = btn.dataset.regionId;
      renderWestBengalMap(selectedRegion);
      renderDistrictList('', selectedRegion);
    });
  });

  const tooltip = $('wb-district-tooltip');
  const titleEl = $('tooltip-title');
  const bnEl = $('tooltip-bn');
  const metaEl = $('tooltip-meta');

  container.querySelectorAll('[data-district-id]').forEach(path => {
    path.addEventListener('mouseenter', e => {
      if (titleEl) titleEl.textContent = path.dataset.districtName;
      if (bnEl) bnEl.textContent = path.dataset.districtBn;
      if (metaEl) metaEl.textContent = `HQ: ${path.dataset.districtHq} · ${path.dataset.districtRegion}`;
      if (tooltip) tooltip.classList.remove('hidden');
    });

    path.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.add('hidden');
    });

    path.addEventListener('click', () => {
      const distId = path.dataset.districtId;
      window.location.href = `./district.html?district=${distId}`;
    });
  });
}

function renderDistrictList(filter = '', regionFilter = 'all') {
  const listTarget = $('wb-district-list');
  if (!listTarget) return;

  const term = filter.trim().toLowerCase();
  const filtered = WB_DISTRICTS.filter(d => {
    const matchesTerm = !term || d.nameEn.toLowerCase().includes(term) || d.nameBn.includes(term) || d.region.toLowerCase().includes(term);
    const matchesRegion = regionFilter === 'all' || d.region === regionFilter;
    return matchesTerm && matchesRegion;
  });

  listTarget.innerHTML = filtered.map(d => `
    <button class="district-chip" data-district-id="${d.id}" title="Click for ${d.nameEn} district news">
      <span>${d.nameEn}</span>
      <span style="font-size:0.65rem; opacity:0.75;">›</span>
    </button>
  `).join('');

  listTarget.querySelectorAll('[data-district-id]').forEach(chip => {
    chip.addEventListener('click', () => {
      window.location.href = `./district.html?district=${chip.dataset.districtId}`;
    });
  });
}

bindUi();
updateClock();
setInterval(updateClock, 1000);
if (!firebaseConfigured) {
  showSetupMessage();
  state.articles = DEFAULT_DEMO_ARTICLES;
  renderArticles();
  renderHero();
  renderHeadlineStrip();
  renderVideos([]);
  renderPoll(null);
} else {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    $('sync-status').textContent = 'LIVE DATA';
    startRealtimeListeners();
    loadArticles();
    loadVideosAndPoll();
  } catch (e) {
    console.warn('Firebase init error, using fallback feeds:', e);
    state.articles = DEFAULT_DEMO_ARTICLES;
    renderArticles();
    renderHero();
    renderHeadlineStrip();
    renderVideos([]);
    renderPoll(null);
  }
}


