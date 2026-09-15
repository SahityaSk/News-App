const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

const Article = require('../models/Article');
const BreakingTicker = require('../models/BreakingTicker');
const LiveStream = require('../models/LiveStream');
const Reel = require('../models/Reel');
const Poll = require('../models/Poll');
const Subscriber = require('../models/Subscriber');

// All admin routes require JWT authentication
router.use(authenticateToken);

// ------------------------------------------------------------------
// 1. Articles CRUD
// ------------------------------------------------------------------

// GET /api/admin/articles
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/articles
router.post('/articles', async (req, res) => {
  try {
    const articleData = req.body;
    articleData.articleId = `art-custom-${Date.now()}`;
    const newArticle = await Article.create(articleData);

    // Emit Socket.io update if available
    const io = req.app.get('io');
    if (io) io.emit('article_published', newArticle);

    res.status(201).json({ success: true, data: newArticle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/articles/:id
router.put('/articles/:id', async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 2. Breaking News Ticker Management & Instant WebSocket Broadcast
// ------------------------------------------------------------------

// GET /api/admin/ticker
router.get('/ticker', async (req, res) => {
  try {
    const tickers = await BreakingTicker.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, data: tickers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/ticker
router.post('/ticker', async (req, res) => {
  try {
    const tickerData = req.body;
    tickerData.tickerId = `ticker-${Date.now()}`;
    const newTicker = await BreakingTicker.create(tickerData);

    // Broadcast WebSocket push alert to all live user browsers!
    const io = req.app.get('io');
    if (io) {
      io.emit('breaking_ticker_push', newTicker);
    }

    res.status(201).json({ success: true, data: newTicker });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/ticker/:id
router.delete('/ticker/:id', async (req, res) => {
  try {
    await BreakingTicker.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticker item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 3. Live Broadcast Manager
// ------------------------------------------------------------------

// PUT /api/admin/livestream
router.put('/livestream', async (req, res) => {
  try {
    let stream = await LiveStream.findOne();
    if (!stream) {
      req.body.streamId = 'hero-live-stream';
      stream = await LiveStream.create(req.body);
    } else {
      Object.assign(stream, req.body);
      await stream.save();
    }

    // Broadcast live TV stream update to clients
    const io = req.app.get('io');
    if (io) {
      io.emit('live_stream_updated', stream);
    }

    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 4. Newsletter Subscribers Overview
// ------------------------------------------------------------------

// GET /api/admin/subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, count: subs.length, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
