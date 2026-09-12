const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'PULSE News Live REST API',
    endpoints: [
      '/api/breaking',
      '/api/hero',
      '/api/news',
      '/api/reels',
      '/api/weather-stocks'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`📡 PULSE News Backend Server running on http://localhost:${PORT}`);
});
