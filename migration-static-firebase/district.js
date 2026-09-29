import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS, WB_MAP_VIEWBOX } from './wb-map-data.js';

const $ = id => document.getElementById(id);
const savedKey = 'yugantar_saved_articles';
const savedLanguageKey = 'yugantar_language';

const getStoredLanguage = () => {
  try { return ['BN', 'EN', 'HI'].includes(localStorage.getItem(savedLanguageKey)) ? localStorage.getItem(savedLanguageKey) : 'BN'; }
  catch { return 'BN'; }
};
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

const districtUi = {
  BN: {
    utilityLive: 'বাংলার জেলা ডেস্ক', syncStatus: 'জেলা সংবাদ সরাসরি', brandSlogan: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
    allNews: '← সব খবর', languageLabel: 'ভাষা', homeLabel: 'যুগান্তর নিউজ হোম', savedLabel: 'সেভ করা খবর খুলুন', subscribers: 'গ্রাহক', subscribersTitle: 'সাবস্ক্রাইবার ও সদস্যতা', careers: 'ক্যারিয়ার', careersTitle: 'ক্যারিয়ার ও চাকরির সুযোগ', hiring: 'নিয়োগ চলছে',
    navAll: 'সব জেলার খবর', navInfrastructure: 'পরিকাঠামো', navCulture: 'সংস্কৃতি ও পর্যটন', navEconomy: 'অর্থনীতি ও কৃষি', navHealth: 'শিক্ষা ও স্বাস্থ্য', navEnvironment: 'পরিবেশ',
    liveDesk: 'লাইভ ডেস্ক', switchDistrict: 'জেলা বদলান:', districtHq: 'জেলা সদর', regionZone: 'অঞ্চল', activeStories: 'প্রকাশিত খবর', localStatus: 'স্থানীয় সংবাদ', verifiedFeed: '● যাচাইকৃত সংবাদ',
    districtTicker: 'জেলার ব্রেকিং খবর', localDesk: 'স্থানীয় সংবাদ ডেস্ক', latestDistrict: 'জেলার সর্বশেষ খবর', searchStories: 'জেলার খবর খুঁজুন', searchPlaceholder: 'এই জেলার খবর খুঁজুন…',
    interactiveMap: 'ইন্টার‌্যাক্টিভ মানচিত্র', westBengalMap: 'পশ্চিমবঙ্গের মানচিত্র', mapInstruction: 'দ্রুত জেলা বদলাতে মানচিত্রে ক্লিক করুন।',
    noStories: 'এই জেলায় এখনো বাংলা অনুবাদসহ কোনো খবর নেই।', mapUnavailable: 'মানচিত্রটি এখন লোড করা যাচ্ছে না।',
    breakingIn: 'ব্রেকিং খবর', headquarters: 'জেলা সদর', reporting: 'থেকে খবর আসছে', pageTitle: 'জেলা সংবাদ | যুগান্তর',
    savedTitle: 'সেভ করা খবর', emptySaved: 'আপনার সেভ করা খবরের তালিকা খালি।'
  },
  EN: {
    utilityLive: 'BENGAL DISTRICTS DESK', syncStatus: 'DISTRICT DATA LIVE', brandSlogan: 'নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
    allNews: '← All News', languageLabel: 'Language', homeLabel: 'YUGANTAR News home', savedLabel: 'Open saved articles', subscribers: 'Subs', subscribersTitle: 'View Subscribers & Subscribe', careers: 'Careers', careersTitle: 'Careers & Job Opportunities', hiring: 'Hiring',
    navAll: 'All District News', navInfrastructure: 'Infrastructure', navCulture: 'Culture & Tourism', navEconomy: 'Economy & Agri', navHealth: 'Health & Education', navEnvironment: 'Environment',
    liveDesk: 'LIVE DESK', switchDistrict: 'Switch District:', districtHq: 'District HQ', regionZone: 'Region Zone', activeStories: 'Active Stories', localStatus: 'Local Status', verifiedFeed: '● Verified Feed',
    districtTicker: 'DISTRICT TICKER', localDesk: 'LOCAL DESK REPORTING', latestDistrict: 'Latest District Coverage', searchStories: 'Search district stories', searchPlaceholder: 'Search in this district…',
    interactiveMap: 'INTERACTIVE MAP', westBengalMap: 'West Bengal Map', mapInstruction: 'Click any district to switch views instantly.',
    noStories: 'No Bengali-translated stories are available for this district yet.', mapUnavailable: 'The map is temporarily unavailable.',
    breakingIn: 'BREAKING IN', headquarters: 'Headquarters', reporting: 'reporting local developments', pageTitle: 'District News | YUGANTAR',
    savedTitle: 'Saved articles', emptySaved: 'Your saved reading list is empty.'
  },
  HI: {
    utilityLive: 'बंगाल जिला डेस्क', syncStatus: 'जिला समाचार लाइव', brandSlogan: 'नিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।',
    allNews: '← सभी समाचार', languageLabel: 'भाषा', homeLabel: 'युगांतर समाचार होम', savedLabel: 'सेव किए गए समाचार खोलें', subscribers: 'सब्सक्राइबर', subscribersTitle: 'सब्सक्राइबर और सदस्यता', careers: 'करियर', careersTitle: 'करियर और नौकरी के अवसर', hiring: 'भर्ती जारी',
    navAll: 'सभी जिलों की खबरें', navInfrastructure: 'बुनियादी ढांचा', navCulture: 'संस्कृति और पर्यटन', navEconomy: 'अर्थव्यवस्था और कृषि', navHealth: 'शिक्षा और स्वास्थ्य', navEnvironment: 'पर्यावरण',
    liveDesk: 'लाइव डेस्क', switchDistrict: 'जिला बदलें:', districtHq: 'जिला मुख्यालय', regionZone: 'क्षेत्र', activeStories: 'प्रकाशित खबरें', localStatus: 'स्थानीय समाचार', verifiedFeed: '● सत्यापित फ़ीड',
    districtTicker: 'जिला ब्रेकिंग न्यूज़', localDesk: 'स्थानीय समाचार डेस्क', latestDistrict: 'जिले की ताज़ा खबरें', searchStories: 'जिले की खबरें खोजें', searchPlaceholder: 'इस जिले में खोजें…',
    interactiveMap: 'इंटरैक्टिव नक्शा', westBengalMap: 'पश्चिम बंगाल का नक्शा', mapInstruction: 'तुरंत जिला बदलने के लिए नक्शे पर क्लिक करें।',
    noStories: 'इस जिले के लिए अभी बंगाली अनुवाद वाली खबरें उपलब्ध नहीं हैं।', mapUnavailable: 'नक्शा अभी उपलब्ध नहीं है।',
    breakingIn: 'ब्रेकिंग न्यूज़', headquarters: 'मुख्यालय', reporting: 'से स्थानीय खबरें', pageTitle: 'जिला समाचार | युगांतर',
    savedTitle: 'सेव किए गए समाचार', emptySaved: 'आपकी सेव की गई सूची खाली है।'
  }
};

const districtDescriptions = {
  darjeeling: ['পাহাড়ের রানি, ইউনেস্কো বিশ্ব ঐতিহ্যের রেলপথ, কাঞ্চনজঙ্ঘার দৃশ্য এবং বিশ্ববিখ্যাত চা।', 'पहाड़ों की रानी, यूनेस्को विश्व धरोहर रेलवे, कंचनजंघा के नज़ारे और विश्वप्रसिद्ध चाय।'],
  kalimpong: ['হিমালয়ের অর্কিড, ডেলো পাহাড়, ঐতিহাসিক সিল্ক রুট এবং পরিবেশবান্ধব পর্যটনকেন্দ্র।', 'हिमालयी ऑर्किड, डेलो पहाड़ी, ऐतिहासिक सिल्क रूट और ईको-पर्यटन स्थल।'],
  jalpaiguri: ['সবুজ চা-বাগান, তিস্তা নদীর উপত্যকা, গরুমারা জাতীয় উদ্যান এবং ডুয়ার্সের পর্যটন।', 'हरे-भरे चाय बागान, तीस्ता नदी की घाटी, गोरुमारा राष्ट्रीय उद्यान और डुआर्स पर्यटन।'],
  alipurduar: ['বক্সা ব্যাঘ্র সংরক্ষণাগার, জয়ন্তী পাহাড়, ভুটানের প্রবেশপথ এবং হাতির চলাচলের করিডর।', 'बक्सा टाइगर रिज़र्व, जयंती पहाड़ियां, भूटान का प्रवेशद्वार और हाथियों के गलियारे।'],
  'cooch-behar': ['কোচবিহার রাজপ্রাসাদ, মদনমোহন মন্দির এবং ঐতিহ্যবাহী নগর পরিকল্পনার জেলা।', 'कूचबिहार राजमहल, मदनमोहन मंदिर और ऐतिहासिक नगर नियोजन का जिला।'],
  'uttar-dinajpur': ['রায়গঞ্জ কুলিক পাখিরালয় এবং উত্তর ও দক্ষিণবঙ্গের সংযোগকারী গুরুত্বপূর্ণ জনপদ।', 'रायগঞ্জ कुलिक पक्षी अभयारण्य और उत्तर व दक्षिण बंगाल को जोड़ने वाला अहम क्षेत्र।'],
  'dakshin-dinajpur': ['কৃষিনির্ভর জনপদ, হিলি আন্তর্জাতিক সীমান্ত এবং প্রত্নতাত্ত্বিক ঐতিহ্যের অঞ্চল।', 'कृषि प्रधान क्षेत्र, हिली अंतरराष्ट्रीय सीमा चौकी और पुरातात्विक विरासत।'],
  malda: ['ফজলি আমের জন্য বিখ্যাত; প্রাচীন গৌড়, আদিনা মসজিদের ধ্বংসাবশেষ এবং রেশমশিল্পের কেন্দ্র।', 'फ़ज़ली आम के लिए प्रसिद्ध; प्राचीन गौड़, अदीना मस्जिद के अवशेष और रेशम उद्योग का केंद्र।'],
  murshidabad: ['নবাবি বাংলার রাজধানী, হাজারদুয়ারি প্রাসাদ, কাটরা মসজিদ এবং ভাগীরথীর ঐতিহ্য।', 'नवाबी राजधानी, हज़ारदुआरी महल, कटरा मस्जिद और भागीरथी नदी की विरासत।'],
  birbhum: ['শান্তিনিকেতন ও বিশ্বভারতী, বাউল সংগীত এবং বক্রেশ্বরের উষ্ণ প্রস্রবণের জেলা।', 'शांतिनिकेतन और विश्वभारती, बाउल संगीत तथा बक्रेश्वर के गर्म जलस्रोतों का क्षेत्र।'],
  nadia: ['শ্রীচৈতন্য মহাপ্রভুর জন্মভূমি, মায়াপুরের ইসকন সদর দপ্তর, মাটির পুতুল ও তাঁতশিল্প।', 'श्री चैतन्य महाप्रभु की जन्मभूमि, मायापुर स्थित इस्कॉन मुख्यालय, मिट्टी के मॉडल और तांत बुनाई।'],
  'purba-bardhaman': ['বাংলার ধানের গোলা, ১০৮ শিবমন্দির, ঐতিহাসিক কার্জন গেট এবং মিহিদানার জন্য পরিচিত।', 'बंगाल का धान का कटोरा, 108 शिव मंदिर, ऐतिहासिक कर्ज़न गेट और मिहिदाना मिठाई के लिए प्रसिद्ध।'],
  'paschim-bardhaman': ['শিল্পাঞ্চল, দুর্গাপুর স্টিল প্ল্যান্ট, ইস্কো বার্নপুর এবং রানিগঞ্জের কয়লাখনি।', 'औद्योगिक क्षेत्र, दुर्गापुर स्टील प्लांट, इस्को बर्नपुर और रानीगंज की कोयला खदानें।'],
  purulia: ['ছৌ মুখোশ নাচ, অযোধ্যা পাহাড়, বামনি জলপ্রপাত এবং আদিবাসী লোকশিল্পের জেলা।', 'छऊ मुखौटा नृत्य, अयोध्या पहाड़ियां, बामनी जलप्रपात और आदिवासी लोककला का जिला।'],
  bankura: ['বিষ্ণুপুরের পোড়ামাটির মন্দির, মুকুটমণিপুর বাঁধ এবং শুশুনিয়া পাহাড়ের জন্য বিখ্যাত।', 'बिष्णुपुर के टेराकोटा मंदिर, मुकुटमणिपुर बांध और शुशुनिया पहाड़ियों के लिए प्रसिद्ध।'],
  jhargram: ['বনাঞ্চলের সৌন্দর্য, ঝাড়গ্রাম রাজবাড়ি, বেলপাহাড়ির পরিবেশবান্ধব পর্যটন এবং আদিবাসী সংস্কৃতি।', 'वनों की सुंदरता, झाड़ग्राम राजमहल, बेलपहाड़ी ईको-पर्यटन और आदिवासी संस्कृति।'],
  'paschim-medinipur': ['ঐতিহাসিক মেদিনীপুর শহর, বাংলার গ্র্যান্ড ক্যানিয়ন গনগনি এবং গোপগড় ইকো পার্ক।', 'ऐतिहासिक मिदनापुर शहर, बंगाल का ग्रैंड कैन्यन गोनगनी और गोपगढ़ इको पार्क।'],
  'purba-medinipur': ['দিঘা ও মন্দারমণির সমুদ্রসৈকত, হলদিয়া বন্দর এবং প্রাচীন তাম্রলিপ্তের ঐতিহ্য।', 'दीघा और मंदारमणि के समुद्रतट, हल्दिया बंदरगाह और प्राचीन ताम्रलिप्त की विरासत।'],
  hooghly: ['ফরাসি চন্দননগর, পর্তুগিজ ব্যান্ডেল চার্চ, ডাচ চিনসুরা এবং তারকেশ্বরের ঐতিহ্য।', 'फ्रांसीसी चंदननगर, पुर्तगाली बैंडेल चर्च, डच चिनसुरा और तारकेश्वर की विरासत।'],
  howrah: ['আইকনিক রবীন্দ্র সেতু, বোটানিক্যাল গার্ডেনের বিশাল বটগাছ এবং ঐতিহাসিক রেল টার্মিনাস।', 'प्रसिद्ध रवीन्द्र सेतु, बॉटनिकल गार्डन का विशाल बरगद और ऐतिहासिक रेल टर्मिनस।'],
  kolkata: ['ভিক্টোরিয়া মেমোরিয়াল, ট্রাম, ইডেন গার্ডেন্স এবং ইউনেস্কোর স্বীকৃত দুর্গাপুজোর শহর।', 'विक्टोरिया मेमोरियल, ट्राम, ईडन गार्डन्स और यूनेस्को मान्यता प्राप्त दुर्गापूजा का शहर।'],
  'north-24-parganas': ['সল্টলেক সেক্টর ফাইভের তথ্যপ্রযুক্তি কেন্দ্র, নিউ টাউন এবং নেতাজি সুভাষ বিমানবন্দর-সহ জনবহুল জেলা।', 'साल्ट लेक सेक्टर V का आईटी हब, न्यू टाउन और नेताजी सुभाष हवाई अड्डे वाला घनी आबादी का जिला।'],
  'south-24-parganas': ['সুন্দরবনের ইউনেস্কো বিশ্ব ঐতিহ্যের ম্যানগ্রোভ অরণ্য, রয়্যাল বেঙ্গল টাইগার এবং গঙ্গাসাগর তীর্থ।', 'सुंदरबन का यूनेस्को विश्व धरोहर मैंग्रोव वन, रॉयल बंगाल टाइगर और गंगासागर तीर्थ।']
};

function translateDistrictUi() {
  const dict = districtUi[state.language] || districtUi.EN;
  document.documentElement.lang = state.language === 'BN' ? 'bn' : (state.language === 'HI' ? 'hi' : 'en');
  document.querySelector('.brand')?.setAttribute('aria-label', dict.homeLabel);
  $('saved-toggle')?.setAttribute('aria-label', dict.savedLabel);
  $('saved-toggle')?.setAttribute('title', dict.savedLabel);
  $('subscribers-btn')?.setAttribute('title', dict.subscribersTitle);
  $('jobs-btn')?.setAttribute('title', dict.careersTitle);
  document.querySelectorAll('[data-district-i18n]').forEach(element => {
    const value = dict[element.dataset.districtI18n];
    if (!value) return;
    const icon = element.querySelector('i');
    if (icon) { element.textContent = ` ${value}`; element.prepend(icon); }
    else element.textContent = value;
  });
  document.querySelectorAll('[data-district-placeholder]').forEach(element => {
    const value = dict[element.dataset.districtPlaceholder];
    if (value) element.placeholder = value;
  });
  document.title = dict.pageTitle;
}

function districtName(district) {
  return state.language === 'BN' ? district.nameBn : (state.language === 'HI' ? district.nameHi : district.nameEn);
}

function districtRegionName(region) {
  const names = {
    BN: { 'North Bengal': 'উত্তরবঙ্গ', 'Central Bengal': 'মধ্যবঙ্গ', 'Western Rarh': 'পশ্চিম রাঢ়', 'South Bengal': 'দক্ষিণবঙ্গ', 'Coastal Delta': 'উপকূলীয় বদ্বীপ' },
    HI: { 'North Bengal': 'उत्तर बंगाल', 'Central Bengal': 'मध्य बंगाल', 'Western Rarh': 'पश्चिम राढ़', 'South Bengal': 'दक्षिण बंगाल', 'Coastal Delta': 'तटीय डेल्टा' }
  };
  return names[state.language]?.[region] || region;
}

function districtDescription(district) {
  if (state.language === 'EN') return district.desc;
  const translated = districtDescriptions[district.id];
  return translated ? translated[state.language === 'HI' ? 1 : 0] : district.desc;
}

function headquartersName(district) {
  if (district.hq === district.nameEn) return districtName(district);
  const names = {
    BN: { Raiganj: 'রায়গঞ্জ', Balurghat: 'বালুরঘাট', 'English Bazar': 'ইংরেজবাজার', Baharampur: 'বহরমপুর', Suri: 'সিউড়ি', Krishnanagar: 'কৃষ্ণনগর', Bardhaman: 'বর্ধমান', Asansol: 'আসানসোল', Midnapore: 'মেদিনীপুর', Tamluk: 'তমলুক', Chinsurah: 'চুঁচুড়া', Alipore: 'আলিপুর', Barasat: 'বারাসত' },
    HI: { Raiganj: 'रायगंज', Balurghat: 'बालुरघाट', 'English Bazar': 'इंग्लिश बाज़ार', Baharampur: 'बहरामपुर', Suri: 'सूरी', Krishnanagar: 'कृष्णनगर', Bardhaman: 'बर्धमान', Asansol: 'आसनसोल', Midnapore: 'मिदनापुर', Tamluk: 'तमलुक', Chinsurah: 'चुंचुड़ा', Alipore: 'अलीपुर', Barasat: 'बारासात' }
  };
  return names[state.language]?.[district.hq] || district.hq;
}

function getDistrictNews(districtId, articles, maxItems = 10) {
  return articles.filter(article => article.districtId === districtId).slice(0, maxItems);
}

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeUrl = value => { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const isSaved = id => state.saved.some(art => art.id === id);
const text = (value, language = state.language) => typeof value === 'string' ? value : (value?.[language] || value?.EN || value?.BN || value?.HI || '');
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
const dateText = value => { const d = value?.toDate ? value.toDate() : (value ? new Date(value) : null); const locale = state.language === 'BN' ? 'bn-BD' : (state.language === 'HI' ? 'hi-IN' : 'en-US'); return d && !Number.isNaN(d.getTime()) ? d.toLocaleString(locale) : (state.language === 'BN' ? 'সম্প্রতি' : 'Recently'); };

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $('theme-toggle');
  if (toggle) {
    const titles = { BN: theme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন', EN: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', HI: theme === 'dark' ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें' };
    toggle.title = titles[state.language] || titles.EN;
    toggle.setAttribute('aria-label', toggle.title);
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
  select.innerHTML = WB_DISTRICTS.map(d => `<option value="${d.id}" ${d.id === state.districtId ? 'selected' : ''}>${escapeHtml(districtName(d))}</option>`).join('');
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

    return `<path d="${d.svgPath}"${clipAttr} fill="${active ? '#d92535' : baseColor}" stroke="${active ? '#ffffff' : '#334155'}" stroke-width="${active ? '2.5' : '1'}" class="mini-map-path ${active ? 'active' : ''}" data-district-id="${d.id}"><title>${escapeHtml(districtName(d))}</title></path>`;
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
    listTarget.innerHTML = WB_DISTRICTS.map(d => `<button class="district-chip ${d.id === state.districtId ? 'active' : ''}" data-district-id="${d.id}">${escapeHtml(districtName(d))}</button>`).join('');
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
        featureLayer.bindTooltip(districtName(district), { sticky: true });
        featureLayer.on('click', () => switchDistrict(district.id));
        featureLayer.on('mouseover', event => event.target.setStyle({ weight: 2.5, color: '#ffffff', fillColor: '#d92535', fillOpacity: 1 }));
        featureLayer.on('mouseout', event => layer.resetStyle(event.target));
      }
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [4, 4] });
    window.setTimeout(() => map.invalidateSize(), 0);
  } catch (error) {
    console.error('District GeoJSON map failed:', error);
    container.innerHTML = `<div class="empty-state">${escapeHtml((districtUi[state.language] || districtUi.EN).mapUnavailable)}</div>`;
  }

  const listTarget = $('district-list-quick');
  if (listTarget) {
    listTarget.innerHTML = WB_DISTRICTS.map(d => `<button class="district-chip ${d.id === state.districtId ? 'active' : ''}" data-district-id="${d.id}">${escapeHtml(districtName(d))}</button>`).join('');
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
  const dict = districtUi[state.language] || districtUi.EN;
  const description = districtDescription(d);
  const hq = headquartersName(d);
  const titleEl = $('district-title');
  const subEl = $('district-subtitle');
  const hqEl = $('stat-hq');
  const regEl = $('stat-region');
  const countEl = $('stat-count');
  const regionPill = $('district-region-pill');
  const introDesc = $('district-intro-desc');
  const tickerEl = $('district-ticker');

  if (titleEl) titleEl.textContent = districtName(d);
  if (subEl) subEl.textContent = description;
  if (hqEl) hqEl.textContent = hq;
  if (regEl) regEl.textContent = districtRegionName(d.region);
  if (regionPill) regionPill.textContent = districtRegionName(d.region);
  if (introDesc) introDesc.textContent = state.language === 'BN'
    ? `${districtName(d)} জেলার সাম্প্রতিক খবর, পরিকাঠামো ও জনজীবনের প্রতিবেদন।`
    : state.language === 'HI'
      ? `${districtName(d)} जिले की ताज़ा खबरें, बुनियादी ढांचे और जनजीवन की रिपोर्ट।`
      : `Real-time updates, infrastructure, and community news from ${d.nameEn} district.`;
  if (tickerEl) tickerEl.innerHTML = `<span>${escapeHtml(dict.breakingIn)} ${escapeHtml(districtName(d).toUpperCase())}: ${escapeHtml(description)}</span> <b>•</b> <span>${escapeHtml(dict.headquarters)} ${escapeHtml(hq)} ${escapeHtml(dict.reporting)}.</span>`;
  document.title = `${districtName(d)} · ${dict.pageTitle}`;
}

function updateDistrictStickyOffset() {
  const header = document.querySelector('.site-header');
  if (header) document.documentElement.style.setProperty('--district-sticky-top', `${header.getBoundingClientRect().height + 12}px`);
}

function renderDistrictArticles() {
  const target = $('district-articles');
  if (!target) return;

  const term = state.search.trim().toLowerCase();
  const filtered = state.articles.filter(art => {
    if (!articleAvailableInLanguage(art)) return false;
    const catMatch = state.category === 'all' || art.category === state.category;
    const searchable = `${articleText(art, 'title')} ${articleText(art, 'summary')} ${art.author || ''}`.toLowerCase();
    return catMatch && (!term || searchable.includes(term));
  });

  const countEl = $('stat-count');
  if (countEl) countEl.textContent = String(filtered.length);

  if (!filtered.length) {
    target.innerHTML = `<div class="empty-state">${escapeHtml((districtUi[state.language] || districtUi.EN).noStories)}</div>`;
    return;
  }

  target.innerHTML = filtered.map(article => `
    <article class="article-card" data-article-id="${escapeHtml(article.id)}">
      <div class="media-frame">
        <img loading="lazy" src="${escapeHtml(article.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80')}" alt="${escapeHtml(articleText(article, 'title'))}">
      </div>
      <div class="article-body">
        <span class="tag">${escapeHtml(article.category || 'DISTRICT NEWS')}</span>
        <h3>${escapeHtml(articleText(article, 'title'))}</h3>
        <p>${escapeHtml(articleText(article, 'summary'))}</p>
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
  target.innerHTML = state.saved.map(article => `<div class="saved-item"><button class="saved-open" data-open-saved="${escapeHtml(article.id)}" type="button"><strong>${escapeHtml(articleText(article, 'title'))}</strong><small>${escapeHtml(article.sourceAgency || 'YUGANTAR')} · ${escapeHtml(dateText(article.publishedAt))}</small></button><button class="saved-remove" data-remove-saved="${escapeHtml(article.id)}" type="button" aria-label="Remove saved article">×</button></div>`).join('');
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
  $('article-detail').innerHTML = `<span class="tag">${escapeHtml(article.category || 'DISTRICT NEWS')}</span><h1>${escapeHtml(articleText(article, 'title'))}</h1><p class="muted">${escapeHtml(article.author || 'YUGANTAR Bengal Desk')} · ${escapeHtml(dateText(article.publishedAt))}</p><div class="media-frame" style="aspect-ratio:16/9; min-height:220px; border-radius:12px; margin:16px 0;"><img src="${escapeHtml(article.image || '')}" alt="${escapeHtml(articleText(article, 'title'))}"></div><div class="article-actions"><button class="button" data-dialog-save="${escapeHtml(article.id)}" type="button">${isSaved(article.id) ? '★ Saved' : '☆ Save article'}</button>${sourceUrl ? `<a class="button button-outline" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">View original source</a>` : ''}</div><p class="lead">${escapeHtml(articleText(article, 'summary'))}</p><div class="article-copy">${escapeHtml(articleText(article, 'content') || articleText(article, 'summary')).replace(/\n/g, '<br>')}</div>`;
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
    console.warn('Firestore load failed for district page, using local district news:', err);
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
    translateDistrictUi();
    setTheme(document.documentElement.dataset.theme || 'light');
    updateDistrictStickyOffset();
    populateDistrictSelect();
    renderDistrictHeader();
    renderDistrictArticles();
    renderSaved();
    renderMiniWbMap();
  });
  window.addEventListener('storage', event => {
    if (event.key !== savedLanguageKey || !['BN', 'EN', 'HI'].includes(event.newValue)) return;
    state.language = event.newValue;
    if (langSelect) langSelect.value = state.language;
    translateDistrictUi();
    setTheme(document.documentElement.dataset.theme || 'light');
    updateDistrictStickyOffset();
    populateDistrictSelect();
    renderDistrictHeader();
    renderDistrictArticles();
    renderSaved();
    renderMiniWbMap();
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
  translateDistrictUi();
  renderDistrictHeader();
  renderMiniWbMap();
  renderSaved();
  updateDistrictStickyOffset();
  window.addEventListener('resize', updateDistrictStickyOffset);
}

bindUi();
updateClock();
setInterval(updateClock, 1000);
loadFirestoreData();
