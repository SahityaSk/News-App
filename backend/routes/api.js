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

// GET /api/news (Supports Live NewsAPI.org & GNews API fetching + fallback dataset)
router.get('/news', async (req, res) => {
  const lang = getLang(req);
  const { category, search } = req.query;
  const newsApiKey = process.env.NEWS_API_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;

  // 1. Try Live GNews API if key exists
  if (gnewsApiKey) {
    try {
      const q = search || (category && category !== 'all' ? category : 'world');
      const langParam = lang === 'BN' ? 'bn' : (lang === 'HI' ? 'hi' : 'en');
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=${langParam}&max=12&apikey=${gnewsApiKey}`;
      
      const apiRes = await fetch(gnewsUrl);
      const apiData = await apiRes.json();

      if (apiData && apiData.articles && apiData.articles.length > 0) {
        const liveArticles = apiData.articles.map((item, idx) => ({
          id: `gnews-${idx}`,
          title: item.title,
          summary: item.description || item.content || item.title,
          category: category || 'world',
          categoryLabel: (category || 'world').toUpperCase(),
          author: item.source?.name || 'Global News Wire',
          time: new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readTime: '3 min read',
          image: item.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          content: item.content || item.description,
          trending: idx < 5,
          views: `${Math.floor(Math.random() * 80 + 20)}K`,
          url: item.url
        }));

        return res.json({ success: true, total: liveArticles.length, isLiveApi: true, data: liveArticles });
      }
    } catch (err) {
      console.warn('⚠️ GNews API fetch failed, falling back to dataset:', err.message);
    }
  }

  // 2. Try Live NewsAPI.org if key exists
  if (newsApiKey) {
    try {
      const q = search || (category && category !== 'all' ? category : 'breaking');
      const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=12&apiKey=${newsApiKey}`;
      
      const apiRes = await fetch(newsApiUrl);
      const apiData = await apiRes.json();

      if (apiData && apiData.articles && apiData.articles.length > 0) {
        const liveArticles = apiData.articles.map((item, idx) => ({
          id: `newsapi-${idx}`,
          title: item.title,
          summary: item.description || item.title,
          category: category || 'world',
          categoryLabel: (category || 'world').toUpperCase(),
          author: item.source?.name || 'International News Wire',
          time: new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readTime: '4 min read',
          image: item.urlToImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          content: item.content || item.description,
          trending: idx < 5,
          views: `${Math.floor(Math.random() * 80 + 20)}K`,
          url: item.url
        }));

        return res.json({ success: true, total: liveArticles.length, isLiveApi: true, data: liveArticles });
      }
    } catch (err) {
      console.warn('⚠️ NewsAPI fetch failed, falling back to dataset:', err.message);
    }
  }

  // 3. High-Quality Multi-lingual Dataset Fallback
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
    isLiveApi: false,
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
  res.json({ success: true, message: `Thank you! ${email} has been subscribed to YUGANTAR Live Alerts.` });
});

module.exports = router;
