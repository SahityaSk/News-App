const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('./auth');
const { logAuditAction } = require('../utils/auditLogger');

const Article = require('../models/Article');
const BreakingTicker = require('../models/BreakingTicker');
const LiveStream = require('../models/LiveStream');
const Reel = require('../models/Reel');
const Poll = require('../models/Poll');
const Subscriber = require('../models/Subscriber');
const { inferStreamType } = require('../config/media');
const {
  validateArticleInput,
  validateTickerInput,
  validateLiveStreamInput,
  validateReelInput
} = require('../config/validation');

// All admin routes require JWT authentication
router.use(authenticateToken);

// ------------------------------------------------------------------
// 1. Articles CRUD & Workflow (Draft -> Review -> Published -> Archived)
// ------------------------------------------------------------------

// GET /api/admin/articles
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1, createdAt: -1 });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/articles/:id
router.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findOne({
      $or: [{ _id: req.params.id }, { articleId: req.params.id }]
    });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/articles
router.post('/articles', requireRole('reporter', 'editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateArticleInput(req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Article validation failed', errors: validation.errors });

    const newArticle = await Article.create({
      ...validation.data,
      articleId: `art-custom-${Date.now()}`,
      author: req.user?.email || validation.data.author || 'YUGANTAR Bureau',
      revisionHistory: [{
        updatedBy: req.user?.email || 'Admin',
        updatedAt: new Date(),
        note: 'Initial article creation'
      }]
    });

    await logAuditAction({
      action: 'ARTICLE_CREATE',
      actor: req.user,
      targetType: 'Article',
      targetId: newArticle.articleId,
      details: { title: newArticle.title?.EN || newArticle.articleId, status: newArticle.status },
      req
    });

    const io = req.app.get('io');
    if (io) io.emit('article_published', newArticle);

    res.status(201).json({ success: true, data: newArticle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/articles/:id
router.put('/articles/:id', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateArticleInput(req.body, { partial: true });
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Article validation failed', errors: validation.errors });

    const existing = await Article.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Article not found' });

    const updatePayload = {
      ...validation.data,
      $push: {
        revisionHistory: {
          updatedBy: req.user?.email || 'Editorial Desk',
          updatedAt: new Date(),
          note: req.body.updateNote || 'Content edited by Editorial Desk'
        }
      }
    };

    const updated = await Article.findByIdAndUpdate(req.params.id, updatePayload, { returnDocument: 'after', runValidators: true });

    await logAuditAction({
      action: 'ARTICLE_UPDATE',
      actor: req.user,
      targetType: 'Article',
      targetId: updated.articleId,
      details: { title: updated.title?.EN, status: updated.status },
      req
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/articles/:id/status
router.patch('/articles/:id/status', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['draft', 'review', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid article status' });
    }

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'published' ? { publishedAt: new Date() } : {}),
        $push: {
          revisionHistory: {
            updatedBy: req.user?.email || 'Editorial Desk',
            updatedAt: new Date(),
            note: `Status changed to ${status}`
          }
        }
      },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });

    await logAuditAction({
      action: `ARTICLE_STATUS_${status.toUpperCase()}`,
      actor: req.user,
      targetType: 'Article',
      targetId: updated.articleId,
      details: { newStatus: status },
      req
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (deleted) {
      await logAuditAction({
        action: 'ARTICLE_DELETE',
        actor: req.user,
        targetType: 'Article',
        targetId: deleted.articleId,
        details: { title: deleted.title?.EN },
        req
      });
    }
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
router.post('/ticker', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateTickerInput(req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Ticker validation failed', errors: validation.errors });

    const newTicker = await BreakingTicker.create({
      ...validation.data,
      tickerId: `ticker-${Date.now()}`
    });

    await logAuditAction({
      action: 'TICKER_CREATE',
      actor: req.user,
      targetType: 'BreakingTicker',
      targetId: newTicker.tickerId,
      details: { title: newTicker.title?.EN },
      req
    });

    const io = req.app.get('io');
    if (io) io.emit('breaking_ticker_push', newTicker);

    res.status(201).json({ success: true, data: newTicker });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/ticker/:id
router.put('/ticker/:id', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateTickerInput(req.body, { partial: true });
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Ticker validation failed', errors: validation.errors });

    const updated = await BreakingTicker.findByIdAndUpdate(req.params.id, validation.data, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ success: false, message: 'Ticker not found' });

    await logAuditAction({
      action: 'TICKER_UPDATE',
      actor: req.user,
      targetType: 'BreakingTicker',
      targetId: updated.tickerId,
      details: { title: updated.title?.EN },
      req
    });

    const io = req.app.get('io');
    if (io) io.emit('breaking_ticker_push', updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/ticker/:id/toggle
router.patch('/ticker/:id/toggle', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const ticker = await BreakingTicker.findById(req.params.id);
    if (!ticker) return res.status(404).json({ success: false, message: 'Ticker not found' });

    ticker.active = !ticker.active;
    await ticker.save();

    await logAuditAction({
      action: 'TICKER_TOGGLE',
      actor: req.user,
      targetType: 'BreakingTicker',
      targetId: ticker.tickerId,
      details: { active: ticker.active },
      req
    });

    res.json({ success: true, data: ticker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/ticker/:id
router.delete('/ticker/:id', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const deleted = await BreakingTicker.findByIdAndDelete(req.params.id);
    if (deleted) {
      await logAuditAction({
        action: 'TICKER_DELETE',
        actor: req.user,
        targetType: 'BreakingTicker',
        targetId: deleted.tickerId,
        req
      });
    }
    res.json({ success: true, message: 'Ticker item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 3. Live Broadcast Manager
// ------------------------------------------------------------------

// PUT /api/admin/livestream
router.put('/livestream', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateLiveStreamInput(req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Live stream validation failed', errors: validation.errors });

    let stream = await LiveStream.findOne();
    if (!stream) {
      stream = await LiveStream.create({
        ...validation.data,
        streamId: 'hero-live-stream',
        streamType: inferStreamType(validation.data.videoUrl)
      });
    } else {
      Object.assign(stream, { ...validation.data, streamType: inferStreamType(validation.data.videoUrl) });
      await stream.save();
    }

    await logAuditAction({
      action: 'LIVESTREAM_UPDATE',
      actor: req.user,
      targetType: 'LiveStream',
      targetId: stream.streamId,
      details: { videoUrl: stream.videoUrl, isLive: stream.isLive },
      req
    });

    const io = req.app.get('io');
    if (io) io.emit('live_stream_updated', stream);

    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 4. Video Reels Manager
// ------------------------------------------------------------------

// GET /api/admin/reels
router.get('/reels', async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reels.length, data: reels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/reels
router.post('/reels', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const validation = validateReelInput(req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: 'Reel validation failed', errors: validation.errors });

    const reel = await Reel.create({
      ...validation.data,
      reelId: `reel-custom-${Date.now()}`
    });

    await logAuditAction({
      action: 'REEL_CREATE',
      actor: req.user,
      targetType: 'Reel',
      targetId: reel.reelId,
      details: { title: reel.title?.EN },
      req
    });

    res.status(201).json({ success: true, data: reel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/reels/:id
router.delete('/reels/:id', requireRole('editor', 'superadmin'), async (req, res) => {
  try {
    const deleted = await Reel.findByIdAndDelete(req.params.id);
    if (deleted) {
      await logAuditAction({
        action: 'REEL_DELETE',
        actor: req.user,
        targetType: 'Reel',
        targetId: deleted.reelId,
        req
      });
    }
    res.json({ success: true, message: 'Reel deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------------
// 5. Newsletter Subscribers Overview
// ------------------------------------------------------------------

// GET /api/admin/subscribers
router.get('/subscribers', requireRole('superadmin'), async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, count: subs.length, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
