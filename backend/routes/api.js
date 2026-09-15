const express = require('express');
const router = express.Router();

const Article = require('../models/Article');
const BreakingTicker = require('../models/BreakingTicker');
const LiveStream = require('../models/LiveStream');
const Reel = require('../models/Reel');
const Poll = require('../models/Poll');
const Subscriber = require('../models/Subscriber');

const { breakingNews, heroCoverage, articles, videoReels, weatherStocks } = require('../data/newsData');

// Helper to sanitize language parameter (default to EN)
const getLang = (req) => {
  const lang = (req.query.lang || 'EN').toUpperCase();
  return ['EN', 'BN', 'HI'].includes(lang) ? lang : 'EN';
};

// Helper to format multi-lingual object based on current language
const resolveLang = (obj, lang) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.EN || obj.BN || obj.HI || '';
};

// GET /api/breaking
router.get('/breaking', async (req, res) => {
  const lang = getLang(req);
  try {
    const tickers = await BreakingTicker.find({ active: true }).sort({ priority: 1 });
    if (tickers && tickers.length > 0) {
      const formatted = tickers.map(t => ({
        id: t.tickerId,
        title: resolveLang(t.title, lang),
        text: resolveLang(t.title, lang),
        category: t.category,
        time: t.time,
        urgent: t.urgent
      }));
      return res.json({ success: true, source: 'database', data: formatted });
    }
  } catch (err) {
    // Fallback if DB offline
  }
  res.json({ success: true, source: 'fallback', data: breakingNews[lang] || breakingNews.EN });
});

// GET /api/hero
router.get('/hero', async (req, res) => {
  const lang = getLang(req);
  const baseFallback = heroCoverage[lang] || heroCoverage.EN;

  try {
    const heroArt = await Article.findOne({ hero: true, status: 'published' });
    const stream = await LiveStream.findOne({ isLive: true });

    if (heroArt) {
      return res.json({
        success: true,
        source: 'database',
        data: {
          ...baseFallback,
          id: heroArt.articleId,
          badge: "LIVE COVERAGE",
          title: resolveLang(heroArt.title, lang) || baseFallback.title,
          headline: resolveLang(heroArt.title, lang) || baseFallback.title,
          summary: resolveLang(heroArt.summary, lang) || baseFallback.summary,
          subheadline: resolveLang(heroArt.summary, lang) || baseFallback.summary,
          author: heroArt.author || baseFallback.author,
          image: heroArt.image || baseFallback.image,
          videoUrl: stream ? stream.videoUrl : baseFallback.videoUrl,
          keyDevelopments: baseFallback.keyDevelopments
        }
      });
    }
  } catch (err) {
    // Fallback if DB offline
  }
  res.json({ success: true, source: 'fallback', data: baseFallback });
});

// GET /api/news
router.get('/news', async (req, res) => {
  const lang = getLang(req);
  const { category, search } = req.query;

  try {
    let query = { status: 'published' };
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    let dbArticles = await Article.find(query).sort({ publishedAt: -1 }).limit(30);

    if (search) {
      const q = search.toLowerCase();
      dbArticles = dbArticles.filter(art => {
        const title = resolveLang(art.title, lang).toLowerCase();
        const summary = resolveLang(art.summary, lang).toLowerCase();
        const author = art.author ? art.author.toLowerCase() : '';
        return title.includes(q) || summary.includes(q) || author.includes(q);
      });
    }

    if (dbArticles && dbArticles.length > 0) {
      const formatted = dbArticles.map(art => ({
        id: art.articleId,
        title: resolveLang(art.title, lang),
        summary: resolveLang(art.summary, lang),
        content: resolveLang(art.content, lang),
        category: art.category,
        categoryLabel: art.category.toUpperCase(),
        author: art.author,
        readTime: art.readTime,
        image: art.image,
        trending: art.trending,
        hero: art.hero,
        views: art.viewsFormatted || `${art.views}K`,
        publishedAt: art.publishedAt
      }));

      return res.json({
        success: true,
        total: formatted.length,
        source: 'database',
        data: formatted
      });
    }
  } catch (err) {
    console.warn('⚠️ DB query error, falling back to newsData:', err.message);
  }

  // Fallback Dataset Logic
  let dataset = articles[lang] || articles.EN;

  if (category && category !== 'all') {
    dataset = dataset.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    dataset = dataset.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: dataset.length,
    source: 'fallback',
    data: dataset
  });
});

// GET /api/reels
router.get('/reels', async (req, res) => {
  const lang = getLang(req);
  try {
    const reelsList = await Reel.find().limit(10);
    if (reelsList && reelsList.length > 0) {
      const formatted = reelsList.map(r => ({
        id: r.reelId,
        title: resolveLang(r.title, lang),
        category: r.category,
        videoUrl: r.videoUrl,
        thumbnail: r.thumbnail,
        duration: r.duration,
        agency: r.agency,
        likes: r.likes,
        shares: r.shares
      }));
      return res.json({ success: true, source: 'database', data: formatted });
    }
  } catch (err) {
    // Fallback if DB offline
  }
  res.json({ success: true, source: 'fallback', data: videoReels[lang] || videoReels.EN });
});

// GET /api/weather-stocks
router.get('/weather-stocks', (req, res) => {
  const liveMarketData = {
    stocks: [
      { symbol: "NIFTY 50", value: "25,480.15", change: "+142.30 (+0.56%)", positive: true },
      { symbol: "SENSEX", value: "83,210.40", change: "+410.85 (+0.50%)", positive: true },
      { symbol: "NASDAQ", value: "18,245.90", change: "+112.40 (+0.62%)", positive: true },
      { symbol: "BTC/USD", value: "$64,250.00", change: "+1,420.00 (+2.26%)", positive: true }
    ],
    weather: {
      city: "New Delhi / Kolkata",
      temp: "31°C Sunny",
      condition: "Partly Cloudy"
    }
  };
  res.json({ success: true, data: liveMarketData });
});

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address required' });
  }

  try {
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), active: true },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (err) {
    // Silent catch if DB offline
  }

  res.json({ success: true, message: `Thank you! ${email} has been subscribed to YUGANTAR Live Alerts.` });
});

module.exports = router;
