const { URL } = require('url');

const LANGUAGES = ['EN', 'BN', 'HI'];
const ARTICLE_CATEGORIES = ['world', 'tech', 'business', 'sports', 'entertainment', 'science', 'national', 'general'];
const ARTICLE_STATUSES = ['draft', 'published', 'archived'];

const cleanText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\u0000/g, '').trim().slice(0, maxLength);
};

const cleanBoolean = (value, fallback = false) => (typeof value === 'boolean' ? value : fallback);

const cleanMultilingual = (value, maxLength) => {
  const source = typeof value === 'string' ? { EN: value } : value;
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;

  return LANGUAGES.reduce((result, language) => {
    result[language] = cleanText(source[language], maxLength);
    return result;
  }, {});
};

const hasLanguageValue = value => value && LANGUAGES.some(language => value[language]);

const isSafeHttpUrl = (value, { allowEmpty = true } = {}) => {
  if (!value && allowEmpty) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost'
      || hostname === '[::1]'
      || hostname === '0.0.0.0'
      || /^127\./.test(hostname)
      || /^10\./.test(hostname)
      || /^192\.168\./.test(hostname)
      || /^169\.254\./.test(hostname)
      || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) return false;

    return true;
  } catch (error) {
    return false;
  }
};

const result = (data, errors = []) => ({
  ok: errors.length === 0,
  data,
  errors
});

const validateArticleInput = (body = {}, { partial = false } = {}) => {
  const data = {};
  const errors = [];
  const has = field => Object.prototype.hasOwnProperty.call(body, field);

  if (!partial || has('title')) {
    data.title = cleanMultilingual(body.title, 300);
    if (!hasLanguageValue(data.title)) errors.push('At least one article title language is required');
  }
  if (!partial || has('summary')) data.summary = cleanMultilingual(body.summary, 1000) || { EN: '', BN: '', HI: '' };
  if (!partial || has('content')) data.content = cleanMultilingual(body.content, 50000) || { EN: '', BN: '', HI: '' };
  if (!partial || has('category')) {
    data.category = cleanText(body.category || 'world', 40).toLowerCase();
    if (!ARTICLE_CATEGORIES.includes(data.category)) errors.push('Unsupported article category');
  }
  if (!partial || has('author')) data.author = cleanText(body.author || 'YUGANTAR Bureau', 120);
  if (!partial || has('sourceAgency')) data.sourceAgency = cleanText(body.sourceAgency || 'YUGANTAR', 120);
  if (!partial || has('sourceUrl')) {
    data.sourceUrl = cleanText(body.sourceUrl, 2048);
    if (!isSafeHttpUrl(data.sourceUrl)) errors.push('Source URL must be a safe HTTP(S) URL');
  }
  if (!partial || has('readTime')) data.readTime = cleanText(body.readTime || '3 min read', 40);
  if (!partial || has('image')) {
    data.image = cleanText(body.image, 2048);
    if (!isSafeHttpUrl(data.image)) errors.push('Image URL must be a safe HTTP(S) URL');
  }
  if (!partial || has('trending')) data.trending = cleanBoolean(body.trending);
  if (!partial || has('hero')) data.hero = cleanBoolean(body.hero);
  if (!partial || has('breaking')) data.breaking = cleanBoolean(body.breaking);
  if (!partial || has('status')) {
    data.status = cleanText(body.status || 'published', 20).toLowerCase();
    if (!ARTICLE_STATUSES.includes(data.status)) errors.push('Unsupported article status');
  }
  if (!partial || has('publishedAt')) {
    const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
    if (Number.isNaN(publishedAt.getTime())) errors.push('publishedAt must be a valid date');
    else data.publishedAt = publishedAt;
  }

  if (partial && Object.keys(data).length === 0) errors.push('At least one editable article field is required');

  return result(data, errors);
};

const validateTickerInput = (body = {}) => {
  const data = {
    title: cleanMultilingual(body.title, 300),
    category: cleanText(body.category || 'BREAKING', 40).toUpperCase(),
    time: cleanText(body.time || 'LIVE', 40),
    urgent: cleanBoolean(body.urgent, true),
    active: cleanBoolean(body.active, true),
    priority: Number.isInteger(body.priority) ? body.priority : 1
  };
  const errors = [];
  if (!hasLanguageValue(data.title)) errors.push('At least one ticker language is required');
  if (data.priority < 0 || data.priority > 1000) errors.push('Ticker priority must be between 0 and 1000');
  return result(data, errors);
};

const validateLiveStreamInput = (body = {}) => {
  const data = {
    videoUrl: cleanText(body.videoUrl, 2048),
    title: cleanMultilingual(body.title, 300) || { EN: '', BN: '', HI: '' },
    summary: cleanMultilingual(body.summary, 1000) || { EN: '', BN: '', HI: '' },
    channelName: cleanText(body.channelName || 'YUGANTAR Live 24/7', 120),
    viewers: cleanText(body.viewers || 'Live', 40),
    isLive: cleanBoolean(body.isLive, true),
    chatEnabled: cleanBoolean(body.chatEnabled, true)
  };
  const errors = [];
  if (!isSafeHttpUrl(data.videoUrl, { allowEmpty: false })) errors.push('A safe HTTP(S) stream URL is required');
  return result(data, errors);
};

const validateReelInput = (body = {}) => {
  const data = {
    title: cleanMultilingual(body.title, 300),
    videoUrl: cleanText(body.videoUrl, 2048),
    thumbnail: cleanText(body.thumbnail, 2048),
    category: cleanText(body.category || 'WORLD', 40).toUpperCase(),
    duration: cleanText(body.duration || 'LIVE', 40),
    agency: cleanText(body.agency || 'Editorial Desk', 120)
  };
  const errors = [];
  if (!hasLanguageValue(data.title)) errors.push('At least one reel title language is required');
  if (!isSafeHttpUrl(data.videoUrl, { allowEmpty: false })) errors.push('A safe HTTP(S) reel URL is required');
  if (!isSafeHttpUrl(data.thumbnail)) errors.push('Thumbnail URL must be a safe HTTP(S) URL');
  return result(data, errors);
};

const validateEmail = value => {
  const email = cleanText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
};

module.exports = {
  isSafeHttpUrl,
  validateArticleInput,
  validateTickerInput,
  validateLiveStreamInput,
  validateReelInput,
  validateEmail
};
