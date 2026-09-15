const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { logAuditAction } = require('../utils/auditLogger');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured before starting the API');
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password || email.length > 254 || password.length > 512) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      await logAuditAction({
        action: 'LOGIN_FAILED',
        actor: { email },
        targetType: 'Admin',
        details: { reason: 'User not found' },
        req
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await logAuditAction({
        action: 'LOGIN_FAILED',
        actor: { email },
        targetType: 'Admin',
        details: { reason: 'Password mismatch' },
        req
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditAction({
      action: 'LOGIN_SUCCESS',
      actor: { email: admin.email, role: admin.role, id: admin._id },
      targetType: 'Admin',
      details: { role: admin.role },
      req
    });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, message: 'Unable to sign in right now' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-passwordHash');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

module.exports = { router, authenticateToken, requireRole, JWT_SECRET };
