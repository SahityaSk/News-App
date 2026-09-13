require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { initNewsIngestor } = require('./workers/newsIngestor');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Save io instance to app
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection & Ingestor Initialization
connectDB().then((connected) => {
  if (connected) {
    initNewsIngestor();
  }
});

// WebSocket Connection Events
io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] New client connected: ${socket.id}`);

  // Broadcast live chat messages in LiveStreamModal
  socket.on('send_chat_message', (data) => {
    io.emit('receive_chat_message', {
      user: data.user || 'Viewer',
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Root Status Page
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'YUGANTAR Enterprise Live News API',
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

server.listen(PORT, () => {
  console.log(`📡 YUGANTAR News Enterprise Server running on http://localhost:${PORT}`);
});
