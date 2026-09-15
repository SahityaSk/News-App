require('dotenv').config();
const connectDB = require('./config/db');
const Article = require('./models/Article');
const BreakingTicker = require('./models/BreakingTicker');
const Reel = require('./models/Reel');

const cleanupDemoContent = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot clean demo content because MongoDB connection failed.');
    process.exitCode = 1;
    return;
  }

  const [articles, tickers, reels] = await Promise.all([
    Article.deleteMany({ articleId: { $in: ['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-art-1', 'art-art-2', 'art-art-3', 'art-art-4', 'art-art-5', 'art-art-6'] } }),
    BreakingTicker.deleteMany({ tickerId: { $in: ['ticker-b1', 'ticker-b2', 'ticker-b3', 'ticker-b4', 'ticker-b5'] } }),
    Reel.deleteMany({ reelId: { $in: ['reel-v1', 'reel-v2'] } })
  ]);

  console.log(`✅ Removed demo content: ${articles.deletedCount} articles, ${tickers.deletedCount} tickers, ${reels.deletedCount} reels.`);
  process.exit(0);
};

cleanupDemoContent();
