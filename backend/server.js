require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { initNewsIngestor } = require('./workers/newsIngestor');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (isProduction && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin);
const corsOrigin = (origin, callback) => {
  if (isAllowedOrigin(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
};

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Save io instance to app
app.set('io', io);
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", 'https://cdn.abplive.com', 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      connectSrc: ["'self'", ...allowedOrigins, 'https://cdn.abplive.com', 'https://www.youtube.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.abplive.com', 'https://www.youtube.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:']
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: req => req.path === '/health' || req.path === '/ready',
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);

// Database Connection & Ingestor Initialization
connectDB().then((connected) => {
  if (connected) {
    initNewsIngestor();
  }
});

// WebSocket Connection Events
io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] New client connected: ${socket.id}`);
  let lastChatAt = 0;

  // Broadcast live chat messages in LiveStreamModal
  socket.on('send_chat_message', (data = {}) => {
    const now = Date.now();
    const text = typeof data.text === 'string' ? data.text.trim().slice(0, 500) : '';
    if (!text || now - lastChatAt < 1000) return;
    lastChatAt = now;

    io.emit('receive_chat_message', {
      user: typeof data.user === 'string' ? data.user.trim().slice(0, 40) || 'Viewer' : 'Viewer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'yugantar-news-api' });
});

app.get('/ready', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  if (!databaseReady) {
    return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
  return res.json({ status: 'ready', database: 'connected' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Root Status Page
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'YUGANTAR News API',
    database: 'MongoDB / Multi-lingual Fallback',
    socket: 'Socket.io Real-time Enabled',
    endpoints: [
      '/api/breaking',
      '/api/hero',
      '/api/news',
      '/api/reels',
      '/api/weather-stocks',
      '/api/auth/login',
      '/api/admin/articles',
      '/api/admin/ticker'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error(`[API] ${req.method} ${req.originalUrl}:`, err.message);
  if (res.headersSent) return next(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`📡 YUGANTAR News Enterprise Server running on http://localhost:${PORT}`);
});
