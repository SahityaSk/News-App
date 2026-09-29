import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  collection, doc, getDocs, getFirestore, limit, onSnapshot, orderBy, query,
  serverTimestamp, addDoc, setDoc, updateDoc, writeBatch, where
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS, WB_REGIONS } from './wb-map-data.js';
import { SPONSORS } from './sponsors-data.js';

const $ = id => document.getElementById(id);
const savedKey = 'yugantar_saved_articles';
const savedLanguageKey = 'yugantar_language';
const getStoredLanguage = () => {
  try { return ['BN', 'EN', 'HI'].includes(localStorage.getItem(savedLanguageKey)) ? localStorage.getItem(savedLanguageKey) : 'BN'; }
  catch { return 'BN'; }
};
const readSaved = () => { try { return JSON.parse(localStorage.getItem(savedKey) || '[]'); } catch { return []; } };
const state = { language: getStoredLanguage(), category: 'all', search: '', articles: [], podcasts: [], saved: readSaved(), poll: null, subscriberCount: null, liveStream: null };
let db;
const legacyWireNames = new Set(['NDTV National Feed', 'ABP Ananda Bengali Feed', 'BBC Hindi Feed', 'NYT World Feed', 'NYT Technology Feed', 'NYT Business Feed', 'NYT Sports Feed']);

const translations = {
  EN: {
    utilityLive: 'LIVE NEWS NETWORK',
    syncStatus: 'LIVE DATA',
    brandSlogan: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
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
    subscribersLabel: 'Subs', careersLabel: 'Careers', hiringLabel: 'Hiring',
    subscribersTitle: 'View Subscribers & Subscribe', careersTitle: 'Careers & Job Opportunities',
    youtubeSubscriberCount: 'YouTube subscribers',
    opinionKicker: 'OPINION',
    newsletterKicker: 'NEWSLETTER',
    newsletterTitle: 'Get the daily bulletin',
    newsletterMuted: 'Top stories, live updates, and newsroom briefs delivered to your inbox.',
    subscribePlaceholder: 'you@example.com',
    subscribeBtn: 'Subscribe',
    readingListKicker: 'YOUR READING LIST',
    savedTitle: 'Saved articles',
    footerAbout: 'Delivering unbiased 24x7 breaking news, real-time video streaming, in-depth editorials, and financial intelligence globally.',
    footerMotto: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
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
    viewSource: 'View original source',
    podcastKicker: 'YUGANTAR AUDIO', podcastTitle: 'Featured podcasts', podcastLoading: 'Loading featured episodes…', podcastEmpty: 'No featured episodes yet. Check back soon.', podcastPlay: 'Listen to episode', podcastUnavailable: 'Featured podcasts are temporarily unavailable.',
    sponsorKicker: 'SPONSOR PARTNERS', sponsorTitle: 'Official Sponsors', sponsorSpotlight: 'SPOTLIGHT', sponsorAll: 'All', sponsorPlatinum: 'Platinum', sponsorGold: 'Gold', sponsorTech: 'Tech', sponsorEmpty: 'No Active Sponsors', sponsorEmptyHelp: 'Sponsor partner banners will automatically display here once assigned.', sponsorJoin: '🤝 Become a Partner', mapKicker: 'WEST BENGAL MAP', mapTitle: 'All 23 Districts', mapHint: 'Click District', mapIntro: 'Select any district on the interactive map to view specific news stories for that district.', searchDistrict: '🔍 Search district (e.g. Kolkata)…', liveUnavailable: 'No live stream configured.', noTicker: 'No active breaking updates.', tickerUnavailable: 'Breaking updates are temporarily unavailable.', noPoll: 'No active poll', pollSoon: 'Check back soon for new audience polls.', pollSubmitting: 'Submitting vote…', pollRecorded: 'Vote recorded. Your selection is highlighted.', pollUnavailable: 'Voting is temporarily unavailable.', categoryLabelNational: 'National', categoryLabelWorld: 'World', categoryLabelBusiness: 'Business', categoryLabelSports: 'Sports', categoryLabelTech: 'Tech', categoryLabelEntertainment: 'Entertainment', categoryLabelScience: 'Science', categoryLabelGeneral: 'General', mapUnavailable: 'Interactive map library could not be loaded. Use the district list below.', mapDataUnavailable: 'Map data could not be loaded. Use the district list below.'
  },
  BN: {
    podcastKicker: 'যুগান্তর অডিও', podcastTitle: 'বিশেষ পডকাস্ট', podcastLoading: 'বিশেষ পর্ব লোড হচ্ছে…', podcastEmpty: 'এখনও কোনো বিশেষ পডকাস্ট নেই। শিগগিরই আবার দেখুন।', podcastPlay: 'পর্বটি শুনুন', podcastUnavailable: 'বিশেষ পডকাস্ট এই মুহূর্তে পাওয়া যাচ্ছে না।',
    utilityLive: 'লাইভ নিউজ নেটওয়ার্ক',
    syncStatus: 'লাইভ ডাটা',
    brandSlogan: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
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
    subscribersLabel: 'সাবস্ক্রাইবার', careersLabel: 'ক্যারিয়ার', hiringLabel: 'নিয়োগ চলছে',
    subscribersTitle: 'সাবস্ক্রাইবার ও সদস্যতা', careersTitle: 'ক্যারিয়ার ও চাকরির সুযোগ',
    youtubeSubscriberCount: 'ইউটিউব সাবস্ক্রাইবার',
    opinionKicker: 'জনমত',
    newsletterKicker: 'নিউজলেটার',
    newsletterTitle: 'দৈনিক বুলেটিন পান',
    newsletterMuted: 'প্রধান খবর, লাইভ আপডেট এবং ইনবক্সে গুরুত্বপূর্ণ খবর পান।',
    subscribePlaceholder: 'আপনার ইমেইল ঠিকানা...',
    subscribeBtn: 'সাবস্ক্রাইব করুন',
    readingListKicker: 'আপনার পঠন তালিকা',
    savedTitle: 'সেভ করা খবর',
    footerAbout: 'বিশ্বজুড়ে ২৪x৭ নিরপেক্ষ ব্রেকিং নিউজ, রিয়েল-টাইম ভিডিও স্ট্রিমিং এবং বিস্তারিত সম্পাদকীয় পরিবেশন।',
    footerMotto: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
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
    emptyArticles: 'এই বিভাগে এখনো বাংলা অনুবাদসহ কোনো খবর প্রকাশিত হয়নি।',
    emptySaved: 'আপনার সেভ করা খবরের তালিকা খালি।',
    saveArticle: '☆ সেভ করুন',
    savedArticle: '★ সেভ করা হয়েছে',
    viewSource: 'মূল উৎস দেখুন', sponsorKicker: 'স্পনসর পার্টনার', sponsorTitle: 'অফিসিয়াল স্পনসর', sponsorSpotlight: 'বিশেষ নজরে', sponsorAll: 'সব', sponsorPlatinum: 'প্ল্যাটিনাম', sponsorGold: 'গোল্ড', sponsorTech: 'প্রযুক্তি', sponsorEmpty: 'এই মুহূর্তে কোনো স্পনসর নেই', sponsorEmptyHelp: 'স্পনসর পার্টনার যুক্ত হলে তাঁদের ব্যানার এখানে দেখা যাবে।', sponsorJoin: '🤝 পার্টনার হোন', mapKicker: 'পশ্চিমবঙ্গের মানচিত্র', mapTitle: '২৩টি জেলা', mapHint: 'জেলা নির্বাচন করুন', mapIntro: 'জেলার খবর দেখতে মানচিত্র থেকে একটি জেলা নির্বাচন করুন।', searchDistrict: '🔍 জেলা খুঁজুন (যেমন কলকাতা)…', liveUnavailable: 'কোনো লাইভ স্ট্রিম সেট করা নেই।', noTicker: 'এই মুহূর্তে কোনো ব্রেকিং আপডেট নেই।', tickerUnavailable: 'ব্রেকিং আপডেট সাময়িকভাবে পাওয়া যাচ্ছে না।', noPoll: 'এই মুহূর্তে কোনো সক্রিয় জনমত নেই', pollSoon: 'নতুন জনমত দেখার জন্য পরে আবার আসুন।', pollSubmitting: 'আপনার ভোট জমা হচ্ছে…', pollRecorded: 'আপনার ভোট নথিভুক্ত হয়েছে। আপনার পছন্দটি চিহ্নিত করা হয়েছে।', pollUnavailable: 'এই মুহূর্তে ভোট দেওয়া যাচ্ছে না।', categoryLabelNational: 'জাতীয়', categoryLabelWorld: 'বিশ্ব', categoryLabelBusiness: 'ব্যবসা', categoryLabelSports: 'খেলাধুলা', categoryLabelTech: 'প্রযুক্তি', categoryLabelEntertainment: 'বিনোদন', categoryLabelScience: 'বিজ্ঞান', categoryLabelGeneral: 'সাধারণ', mapUnavailable: 'মানচিত্র লোড করা যায়নি। নিচের জেলা তালিকা ব্যবহার করুন।', mapDataUnavailable: 'মানচিত্রের তথ্য লোড করা যায়নি। নিচের জেলা তালিকা ব্যবহার করুন।'
  },
  HI: {
    utilityLive: 'लाइव न्यूज नेटवर्क',
    syncStatus: 'लाइव डेटा',
    brandSlogan: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
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
    subscribersLabel: 'सब्सक्राइबर', careersLabel: 'करियर', hiringLabel: 'भर्ती जारी',
    subscribersTitle: 'सब्सक्राइबर और सदस्यता', careersTitle: 'करियर और नौकरी के अवसर',
    youtubeSubscriberCount: 'YouTube सब्सक्राइबर',
    opinionKicker: 'ओपिनियन',
    newsletterKicker: 'न्यूज़लेटर',
    newsletterTitle: 'दैनिक बुलेटिन प्राप्त करें',
    newsletterMuted: 'मुख्य समाचार, लाइव अपडेट और न्यूज़रूम ब्रीफ सीधे इनबॉक्स में पाएं।',
    subscribePlaceholder: 'आपका ईमेल...',
    subscribeBtn: 'सब्सक्राइब करें',
    readingListKicker: 'आपकी रीडिंग लिस्ट',
    savedTitle: 'सेव किए गए समाचार',
    footerAbout: 'दुनिया भर में 24x7 निष्पक्ष ब्रेकिंग न्यूज़, लाइव वीडियो स्ट्रीमिंग और विस्तृत संपादकीय।',
    footerMotto: 'निष्पक्ष खबर, निर्भीक पत्रकारिता | बंगाल, देश और दुनिया की खबर | सच के साथ, जनता के पास।',
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
    viewSource: 'मूल स्रोत देखें', podcastKicker: 'युगांतर ऑडियो', podcastTitle: 'चुनिंदा पॉडकास्ट', podcastLoading: 'चुनिंदा एपिसोड लोड हो रहे हैं…', podcastEmpty: 'अभी कोई चुनिंदा पॉडकास्ट नहीं है। जल्द फिर देखें।', podcastPlay: 'एपिसोड सुनें', podcastUnavailable: 'चुनिंदा पॉडकास्ट अभी उपलब्ध नहीं हैं।',
    sponsorKicker: 'प्रायोजक भागीदार', sponsorTitle: 'आधिकारिक प्रायोजक', sponsorAll: 'सभी', sponsorPlatinum: 'प्लैटिनम', sponsorGold: 'गोल्ड', sponsorTech: 'टेक', sponsorEmpty: 'कोई सक्रिय प्रायोजक नहीं', sponsorEmptyHelp: 'प्रायोजक साझेदार जुड़ने पर उनके बैनर यहां दिखेंगे।', sponsorJoin: '🤝 भागीदार बनें', mapKicker: 'पश्चिम बंगाल का नक्शा', mapTitle: 'सभी 23 जिले', mapHint: 'जिला चुनें', mapIntro: 'जिले की खबरें देखने के लिए नक्शे पर एक जिला चुनें।', searchDistrict: '🔍 जिला खोजें…', liveUnavailable: 'कोई लाइव स्ट्रीम सेट नहीं है।', noTicker: 'अभी कोई ब्रेकिंग अपडेट नहीं है।', tickerUnavailable: 'ब्रेकिंग अपडेट अस्थायी रूप से उपलब्ध नहीं हैं।', noPoll: 'कोई सक्रिय पोल नहीं', pollSoon: 'नए पोल के लिए बाद में फिर देखें।', pollSubmitting: 'आपका वोट जमा हो रहा है…', pollRecorded: 'वोट दर्ज हो गया। आपका चयन हाइलाइट किया गया है।', pollUnavailable: 'अभी वोट करना संभव नहीं है।', categoryLabelNational: 'राष्ट्रीय', categoryLabelWorld: 'दुनिया', categoryLabelBusiness: 'व्यापार', categoryLabelSports: 'खेल', categoryLabelTech: 'टेक', categoryLabelEntertainment: 'मनोरंजन', categoryLabelScience: 'विज्ञान', categoryLabelGeneral: 'सामान्य', mapUnavailable: 'नक्शा लोड नहीं हो सका। नीचे दी गई जिला सूची का उपयोग करें।', mapDataUnavailable: 'नक्शे का डेटा लोड नहीं हो सका। नीचे दी गई जिला सूची का उपयोग करें।'
  }
};

translations.EN.districtSearchNoResults = 'No matching districts found.';
translations.BN.districtSearchNoResults = 'মিলেছে এমন কোনো জেলা নেই।';
translations.HI.districtSearchNoResults = 'कोई मिलता-जुलता जिला नहीं मिला।';

function updateStaticLanguage(lang = state.language) {
  const dict = translations[lang] || translations.EN;
  document.documentElement.lang = lang === 'BN' ? 'bn' : (lang === 'HI' ? 'hi' : 'en');
  $('subscribers-btn')?.setAttribute('title', dict.subscribersTitle);
  $('jobs-btn')?.setAttribute('title', dict.careersTitle);
  $('jobs-btn')?.setAttribute('aria-label', `${dict.careersLabel} ${dict.hiringLabel}`);
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
  renderSubscriberCount();
  renderLiveStream();
}

function renderSubscriberCount() {
  const count = state.subscriberCount;
  const locale = state.language === 'BN' ? 'bn-BD' : (state.language === 'HI' ? 'hi-IN' : 'en-US');
  const header = $('header-sub-count');
  const modal = $('modal-sub-count');
  if (header) header.textContent = Number.isSafeInteger(count) && count >= 0
    ? new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(count)
    : '—';
  if (modal) modal.textContent = Number.isSafeInteger(count) && count >= 0
    ? new Intl.NumberFormat(locale).format(count)
    : '—';
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
const categoryText = category => {
  const keys = { national: 'categoryLabelNational', world: 'categoryLabelWorld', business: 'categoryLabelBusiness', sports: 'categoryLabelSports', tech: 'categoryLabelTech', entertainment: 'categoryLabelEntertainment', science: 'categoryLabelScience', general: 'categoryLabelGeneral' };
  return (translations[state.language] || translations.EN)[keys[String(category || '').toLowerCase()]] || category || 'NEWS';
};
const articleText = (article, field) => {
  const value = article?.[field];
  if (state.language === 'BN' && String(article?.category || '').toLowerCase() === 'world') {
    return typeof value === 'string' ? value : (value?.EN || value?.BN || value?.HI || '');
  }
  if (state.language === 'BN') return typeof value === 'string' ? (article?.sourceLanguage === 'BN' ? value : '') : (value?.BN || '');
  return text(value);
};
const articleAvailableInLanguage = article => {
  if (state.language !== 'BN' || String(article?.category || '').toLowerCase() === 'world') return true;
  const hasBengali = value => typeof value === 'string' ? article?.sourceLanguage === 'BN' && Boolean(value.trim()) : Boolean(value?.BN?.trim());
  return hasBengali(article?.title) && hasBengali(article?.summary);
};
const dateText = value => {
  const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
  const locale = state.language === 'BN' ? 'bn-BD' : (state.language === 'HI' ? 'hi-IN' : 'en-US');
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString(locale) : (state.language === 'BN' ? 'সম্প্রতি' : 'Recently');
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
  target.innerHTML = state.saved.map(article => `<div class="saved-item"><button class="saved-open" data-open-saved="${escapeHtml(article.id)}" type="button"><strong>${escapeHtml(articleText(article, 'title'))}</strong><small>${escapeHtml(article.sourceAgency || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></button><button class="saved-remove" data-remove-saved="${escapeHtml(article.id)}" type="button" aria-label="Remove saved article">×</button></div>`).join('');
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
  const articles = state.articles.filter(article => articleAvailableInLanguage(article) && !legacyWireNames.has(article.sourceAgency) && article.sourceType !== 'wire').filter(article => {
    const categoryMatch = state.category === 'all' || article.category === state.category;
    const searchable = `${articleText(article, 'title')} ${articleText(article, 'summary')} ${article.author || ''} ${article.sourceAgency || ''}`.toLowerCase();
    return categoryMatch && (!term || searchable.includes(term));
  });
  if (!articles.length) { target.innerHTML = `<div class="empty-state">${escapeHtml(dict.emptyArticles)}</div>`; return; }
  target.innerHTML = articles.map(article => `<article class="article-card" data-article-id="${escapeHtml(article.id)}">
    ${imageMarkup(article.image, articleText(article, 'title'), 'YUGANTAR')}
    <div class="article-body"><span class="tag">${escapeHtml(categoryText(article.category))}</span><h3>${escapeHtml(articleText(article, 'title'))}</h3><p>${escapeHtml(articleText(article, 'summary'))}</p><small>${escapeHtml(article.sourceAgency || article.author || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></div>
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
  $('article-detail').innerHTML = `<span class="tag">${escapeHtml(categoryText(article.category))}</span><h1>${escapeHtml(articleText(article, 'title'))}</h1><p class="muted">${escapeHtml(article.author || 'YUGANTAR Editorial')} · ${escapeHtml(dateText(article.publishedAt))}</p>${imageMarkup(article.image, articleText(article, 'title'), 'YUGANTAR')}<div class="article-actions"><button class="button" data-dialog-save="${escapeHtml(article.id)}" type="button">${isSaved(article.id) ? dict.savedArticle : dict.saveArticle}</button>${sourceUrl ? `<a class="button button-outline" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(dict.viewSource)}</a>` : ''}</div><p class="lead">${escapeHtml(articleText(article, 'summary'))}</p><div class="article-copy">${escapeHtml(articleText(article, 'content') || articleText(article, 'summary')).replace(/\n/g, '<br>')}</div>`;
  $('article-detail').querySelector('[data-dialog-save]')?.addEventListener('click', () => toggleSaved(article.id));
  bindImageFallbacks($('article-detail'));
  $('article-dialog').showModal();
}

function renderHero() {
  const availableArticles = state.articles.filter(articleAvailableInLanguage);
  const hero = availableArticles.find(article => article.hero) || availableArticles[0];
  const target = $('hero-card');
  if (!hero) { target.className = 'hero-card empty-state'; target.textContent = (translations[state.language] || translations.EN).emptyArticles; return; }
  target.className = 'hero-card';
  target.innerHTML = `${imageMarkup(hero.image, articleText(hero, 'title'), 'FEATURED')}<div class="hero-copy"><span class="tag">${escapeHtml(hero.breaking ? 'BREAKING' : 'FEATURED')}</span><h1>${escapeHtml(articleText(hero, 'title'))}</h1><p>${escapeHtml(articleText(hero, 'summary'))}</p><button class="button" data-hero-id="${escapeHtml(hero.id)}">Read full story</button></div>`;
  target.querySelector('[data-hero-id]')?.addEventListener('click', () => openArticle(hero.id));
  bindImageFallbacks(target);
}

function renderHeadlineStrip() {
  const target = $('headline-strip');
  if (!target) return;
  const items = state.articles.filter(articleAvailableInLanguage).slice(0, 5);
  target.innerHTML = items.length ? items.map((article, index) => `<button class="headline-item" data-headline-id="${escapeHtml(article.id)}" type="button"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(articleText(article, 'title'))}</strong></button>`).join('') : `<span class="muted">${escapeHtml((translations[state.language] || translations.EN).emptyArticles)}</span>`;
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
  const itemsToRender = Array.isArray(snapshot) ? snapshot.slice(0, 6) : [];
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
  const dict = translations[state.language] || translations.EN;
  if (!poll) { 
    $('poll-question').textContent = dict.noPoll;
    $('poll-options').innerHTML = `<p class="muted" style="margin: 6px 0 0; font-size: 0.82rem;">${escapeHtml(dict.pollSoon)}</p>`;
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
  setStatus($('poll-status'), (translations[state.language] || translations.EN).pollSubmitting);
  try {
    const anonymous = await signInAnonymously(getAuth());
    const pollRef = doc(db, 'polls', state.poll.id); const counts = { ...(state.poll.voteCounts || {}) }; counts[optionId] = Number(counts[optionId] || 0) + 1;
    const batch = writeBatch(db); batch.set(doc(db, 'polls', state.poll.id, 'votes', anonymous.user.uid), { uid: anonymous.user.uid, optionId, createdAt: serverTimestamp() }); batch.update(pollRef, { voteCounts: counts, updatedAt: serverTimestamp() }); await batch.commit();
    state.poll.voteCounts = counts; state.poll.userOption = optionId; renderPoll(state.poll); setStatus($('poll-status'), (translations[state.language] || translations.EN).pollRecorded);
  } catch (error) {
    if (error.code === 'already-exists' || error.code === 'permission-denied') setStatus($('poll-status'), 'This identity has already voted, or the poll is no longer active.', true);
    else setStatus($('poll-status'), (translations[state.language] || translations.EN).pollUnavailable, true);
  }
}

async function loadArticles() {
  try {
    const result = await getDocs(query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(50)));
    const docs = result.docs.map(item => ({ id: item.id, ...item.data() }));
    state.articles = docs;
  } catch (error) {
    console.warn('Articles query failed; showing an empty newsroom state:', error);
    state.articles = [];
  } finally {
    renderArticles(); renderHero(); renderHeadlineStrip();
  }
}

function startRealtimeListeners() {
  onSnapshot(doc(db, 'publicStats', 'subscribers'), snapshot => {
    const summary = snapshot.exists() ? snapshot.data() : null;
    const count = summary?.source === 'youtube' ? Number(summary.count) : NaN;
    state.subscriberCount = Number.isSafeInteger(count) && count >= 0 ? count : null;
    renderSubscriberCount();
  }, error => {
    console.warn('Subscriber count unavailable:', error);
    state.subscriberCount = null;
    renderSubscriberCount();
  });
  onSnapshot(query(collection(db, 'tickers'), where('active', '==', true), orderBy('priority', 'asc'), limit(20)), snapshot => {
    const items = snapshot.docs.map(item => item.data());
    $('ticker-items').innerHTML = items.length ? items.map(item => `<span>${escapeHtml(text(item.title))}</span>`).join(' <b>•</b> ') : (translations[state.language] || translations.EN).noTicker;
  }, () => { $('ticker-items').textContent = (translations[state.language] || translations.EN).tickerUnavailable; });
  onSnapshot(query(collection(db, 'liveStreams'), where('active', '==', true), limit(1)), snapshot => {
    renderLiveStream(snapshot.docs[0]?.data() || null);
  }, error => {
    console.warn('Live stream update unavailable:', error);
    renderLiveStream(null);
  });
}

function renderLiveStream(stream = state.liveStream) {
  state.liveStream = stream || null;
  const liveText = translations[state.language] || translations.EN;
  const title = $('live-title');
  const meta = $('live-meta');
  const player = $('live-player');
  if (!title || !meta || !player) return;

  const streamTitle = text(state.liveStream?.title);
  const streamUrl = safeUrl(state.liveStream?.videoUrl);
  const youtubeVideoId = youtubeId(state.liveStream?.videoUrl);
  title.textContent = streamTitle || liveText.liveTvTitle;
  meta.textContent = state.liveStream?.provider
    ? `${state.liveStream.provider} · ${dateText(state.liveStream.updatedAt)}`
    : liveText.liveTvMeta;
  if (youtubeVideoId) player.innerHTML = youtubeEmbed(youtubeVideoId);
  else if (state.liveStream?.provider === 'facebook' && streamUrl) player.innerHTML = facebookEmbed(streamUrl);
  else if (streamUrl) player.innerHTML = `<a class="button" href="${escapeHtml(streamUrl)}" target="_blank" rel="noreferrer">${escapeHtml(liveText.liveTvAction)}</a>`;
  else player.textContent = liveText.liveUnavailable;

  if (window.FB) window.FB.XFBML.parse(player);
  const action = $('live-action');
  if (action && streamUrl) { action.href = streamUrl; action.classList.remove('hidden'); }
  else if (action) action.classList.add('hidden');
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
    renderFeaturedPodcasts();
    renderSponsors(document.querySelector('[data-sponsor-cat].active')?.dataset.sponsorCat || 'all');
    renderWestBengalMap(selectedRegion);
    renderDistrictList($('wb-district-search')?.value || '', selectedRegion);
    renderArticles();
    renderHero();
    renderHeadlineStrip();
    renderSaved();
    if (state.poll) renderPoll(state.poll);
  });
  window.addEventListener('storage', event => {
    if (event.key !== savedLanguageKey || !['BN', 'EN', 'HI'].includes(event.newValue)) return;
    state.language = event.newValue;
    if (langSelect) langSelect.value = state.language;
    updateStaticLanguage(state.language);
    renderFeaturedPodcasts();
    renderSponsors(document.querySelector('[data-sponsor-cat].active')?.dataset.sponsorCat || 'all');
    renderWestBengalMap(selectedRegion);
    renderDistrictList($('wb-district-search')?.value || '', selectedRegion);
    renderArticles(); renderHero(); renderHeadlineStrip(); renderSaved();
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

  subBtn?.addEventListener('click', () => {
    subDialog?.showModal();
  });

  closeSubDialog?.addEventListener('click', () => {
    subDialog?.close();
  });

  subForm?.addEventListener('submit', e => {
    e.preventDefault();
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
  const dict = translations[state.language] || translations.EN;
  
  if (!filtered || !filtered.length) {
    container.innerHTML = `
      <div class="sponsor-empty-card">
        <span class="empty-icon">📢</span>
        <strong>${escapeHtml(dict.sponsorEmpty)}</strong>
        <p>${escapeHtml(dict.sponsorEmptyHelp)}</p>
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

function renderFeaturedPodcasts(items = state.podcasts) {
  const target = $('featured-podcasts');
  if (!target) return;
  const dict = translations[state.language] || translations.EN;
  if (!items.length) {
    target.innerHTML = `<p class="podcast-empty">${escapeHtml(dict.podcastEmpty)}</p>`;
    return;
  }
  target.innerHTML = items.slice(0, 3).map(episode => {
    const title = text(episode.title);
    const description = text(episode.summary || episode.description);
    const audioUrl = safeUrl(episode.audioUrl || episode.episodeUrl || episode.mediaUrl);
    const imageUrl = safeUrl(episode.coverImage || episode.image);
    return `<article class="podcast-episode">${imageUrl ? `<img class="podcast-cover" src="${escapeHtml(imageUrl)}" alt="">` : '<span class="podcast-cover podcast-cover-fallback" aria-hidden="true">🎙️</span>'}<div class="podcast-episode-copy"><h3>${escapeHtml(title || dict.podcastTitle)}</h3>${description ? `<p>${escapeHtml(description)}</p>` : ''}${audioUrl ? `<audio controls preload="none" aria-label="${escapeHtml(dict.podcastPlay)}: ${escapeHtml(title)}"><source src="${escapeHtml(audioUrl)}"></audio>` : ''}</div></article>`;
  }).join('');
}

async function loadFeaturedPodcasts() {
  if (!db) {
    renderFeaturedPodcasts([]);
    return;
  }
  try {
    const snapshot = await getDocs(query(collection(db, 'podcasts'), where('status', '==', 'published'), limit(30)));
    state.podcasts = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter(episode => episode.featured === true || episode.highlighted === true)
      .sort((a, b) => {
        const date = value => value?.toDate ? value.toDate().getTime() : new Date(value || 0).getTime();
        return date(b.publishedAt) - date(a.publishedAt);
      });
    renderFeaturedPodcasts();
  } catch (error) {
    console.warn('Featured podcasts could not be loaded:', error);
    renderFeaturedPodcasts([]);
  }
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
let wbGeoJsonPromise;

function districtMetaFromFeature(feature) {
  const sourceName = String(feature?.properties?.dtname || feature?.properties?.d_pan_name || '').trim().toLowerCase();
  const normalized = sourceName.replace(/pashchim/g, 'paschim').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return WB_DISTRICTS.find(d => d.nameEn.toLowerCase().replace(/pashchim/g, 'paschim').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === normalized) || null;
}

async function loadWestBengalGeoJson() {
  if (!wbGeoJsonPromise) {
    wbGeoJsonPromise = fetch('./assets/west-bengal-districts.geojson').then(response => {
      if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);
      return response.json();
    });
  }
  return wbGeoJsonPromise;
}

async function renderWestBengalMap(filterRegion = 'all') {
  const container = $('wb-interactive-map-container');
  if (!container) return;

  const regionNamesBn = { all: 'সব জেলা', 'North Bengal': 'উত্তরবঙ্গ', 'Central Bengal': 'মধ্যবঙ্গ', 'Western Rarh': 'পশ্চিম রাঢ়', 'South Bengal': 'দক্ষিণবঙ্গ', 'Coastal Delta': 'উপকূলীয় বদ্বীপ' };
  const regionPills = WB_REGIONS.map(r => `
    <button class="region-pill ${r.id === filterRegion ? 'active' : ''}" data-region-id="${r.id}">
      ${escapeHtml(state.language === 'BN' ? (regionNamesBn[r.id] || r.name) : r.name)}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="wb-map-region-filter">
      ${regionPills}
    </div>
    <div id="wb-leaflet-map" class="wb-leaflet-map" aria-label="Clickable West Bengal district map"></div>
  `;

  container.querySelectorAll('[data-region-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRegion = btn.dataset.regionId;
      renderWestBengalMap(selectedRegion);
      renderDistrictList('', selectedRegion);
    });
  });

  if (!window.L) {
    container.querySelector('.wb-leaflet-map').innerHTML = `<div class="empty-state">${escapeHtml((translations[state.language] || translations.EN).mapUnavailable)}</div>`;
    return;
  }

  try {
    const geoJson = await loadWestBengalGeoJson();
    const map = window.L.map('wb-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      attributionControl: false
    });
    const layer = window.L.geoJSON(geoJson, {
      style: feature => {
        const district = districtMetaFromFeature(feature);
        const active = district && (filterRegion === 'all' || district.region === filterRegion);
        return {
          color: '#334155',
          weight: 1,
          fillColor: district?.color || '#94a3b8',
          fillOpacity: active ? 0.86 : 0.22,
          opacity: active ? 1 : 0.55
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const district = districtMetaFromFeature(feature);
        if (!district) return;
        featureLayer.bindTooltip(`${district.nameEn} (${district.nameBn})<br><small>HQ: ${district.hq}</small>`, { sticky: true, direction: 'top' });
        featureLayer.on({
          mouseover: event => event.target.setStyle({ weight: 2.5, color: '#ffffff', fillColor: '#d92535', fillOpacity: 1 }),
          mouseout: event => layer.resetStyle(event.target),
          click: () => { window.location.href = `./district.html?district=${district.id}`; }
        });
      }
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [8, 8] });
    window.setTimeout(() => map.invalidateSize(), 0);
  } catch (error) {
    console.error('West Bengal GeoJSON map failed:', error);
    container.querySelector('.wb-leaflet-map').innerHTML = `<div class="empty-state">${escapeHtml((translations[state.language] || translations.EN).mapDataUnavailable)}</div>`;
  }
}

function renderDistrictList(filter = '', regionFilter = 'all') {
  const listTarget = $('wb-district-list');
  if (!listTarget) return;

  const term = filter.trim().toLowerCase();
  if (!term) {
    listTarget.innerHTML = '';
    listTarget.hidden = true;
    return;
  }
  listTarget.hidden = false;
  const filtered = WB_DISTRICTS.filter(d => {
    const matchesTerm = d.nameEn.toLowerCase().includes(term) || d.nameBn.includes(term) || d.nameHi.toLowerCase().includes(term) || d.region.toLowerCase().includes(term);
    const matchesRegion = regionFilter === 'all' || d.region === regionFilter;
    return matchesTerm && matchesRegion;
  });

  const dict = translations[state.language] || translations.EN;
  listTarget.innerHTML = filtered.length ? filtered.map(d => `
    <button class="district-chip" data-district-id="${d.id}" title="Click for ${d.nameEn} district news">
      <span>${escapeHtml(state.language === 'BN' ? d.nameBn : (state.language === 'HI' ? d.nameHi : d.nameEn))}</span>
      <span style="font-size:0.65rem; opacity:0.75;">›</span>
    </button>
  `).join('') : `<p class="district-search-empty">${escapeHtml(dict.districtSearchNoResults)}</p>`;

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
  state.articles = [];
  renderFeaturedPodcasts([]);
  renderArticles();
  renderHero();
  renderHeadlineStrip();
  renderVideos([]);
  renderPoll(null);
} else {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  $('sync-status').textContent = (translations[state.language] || translations.EN).syncStatus;
    loadFeaturedPodcasts();
    startRealtimeListeners();
    loadArticles();
    loadVideosAndPoll();
  } catch (e) {
    console.warn('Firebase init error; showing empty production states:', e);
    state.articles = [];
    renderArticles();
    renderHero();
    renderHeadlineStrip();
    renderVideos([]);
    renderPoll(null);
  }
}


