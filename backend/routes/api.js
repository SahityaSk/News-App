const express = require('express');
const router = express.Router();
const { breakingNews, heroCoverage, articles, videoReels, weatherStocks } = require('../data/newsData');

// Helper to sanitize language parameter (default to EN)
const getLang = (req) => {
  const lang = (req.query.lang || 'EN').toUpperCase();
  return ['EN', 'BN', 'HI'].includes(lang) ? lang : 'EN';
};

// GET /api/breaking
router.get('/breaking', (req, res) => {
  const lang = getLang(req);
  res.json({ success: true, data: breakingNews[lang] || breakingNews.EN });
});

// GET /api/hero
router.get('/hero', (req, res) => {
  const lang = getLang(req);
  res.json({ success: true, data: heroCoverage[lang] || heroCoverage.EN });
});

// GET /api/news (Supports language, search query & category filtering)
router.get('/news', (req, res) => {
  const lang = getLang(req);
  const { category, search } = req.query;
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
    data: dataset
  });
});

// GET /api/reels
router.get('/reels', (req, res) => {
  const lang = getLang(req);
  res.json({ success: true, data: videoReels[lang] || videoReels.EN });
});

// GET /api/weather-stocks
router.get('/weather-stocks', (req, res) => {
  res.json({ success: true, data: weatherStocks });
});

// POST /api/subscribe
router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address required' });
  }
  res.json({ success: true, message: `Thank you! ${email} has been subscribed to PULSE Live Alerts.` });
});

module.exports = router;
