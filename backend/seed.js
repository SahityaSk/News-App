require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const BreakingTicker = require('./models/BreakingTicker');
const LiveStream = require('./models/LiveStream');
const Reel = require('./models/Reel');
const Poll = require('./models/Poll');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const { breakingNews, heroCoverage, articles, videoReels } = require('./data/newsData');

const seedData = async () => {
  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    Article.deleteMany({}),
    BreakingTicker.deleteMany({}),
    LiveStream.deleteMany({}),
    Reel.deleteMany({}),
    Poll.deleteMany({}),
    Admin.deleteMany({})
  ]);

  console.log('🌱 Seeding Admin User...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  await Admin.create({
    name: 'Chief Editor',
    email: 'admin@yugantar.com',
    passwordHash,
    role: 'superadmin'
  });

  console.log('🌱 Seeding Breaking Ticker items...');
  const tickerItems = breakingNews.EN.map((enItem, idx) => ({
    tickerId: `ticker-${enItem.id}`,
    title: {
      EN: enItem.title,
      BN: breakingNews.BN[idx]?.title || enItem.title,
      HI: breakingNews.HI[idx]?.title || enItem.title
    },
    category: enItem.category || 'BREAKING',
    time: enItem.time || 'LIVE',
    urgent: enItem.urgent !== false,
    active: true,
    priority: idx + 1
  }));
  await BreakingTicker.insertMany(tickerItems);

  console.log('🌱 Seeding Live Stream Data...');
  await LiveStream.create({
    streamId: 'hero-live-stream',
    title: {
      EN: heroCoverage.EN.headline,
      BN: heroCoverage.BN.headline,
      HI: heroCoverage.HI.headline
    },
    summary: {
      EN: heroCoverage.EN.subheadline,
      BN: heroCoverage.BN.subheadline,
      HI: heroCoverage.HI.subheadline
    },
    channelName: 'YUGANTAR Live Broadcast 24/7',
    streamType: 'youtube_live',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=UCq-Fj5jknLsUf-MWSy4_brA',
    viewers: heroCoverage.EN.viewers || '14.2K',
    isLive: true
  });

  console.log('🌱 Seeding Multi-Lingual Articles...');
  const articleDocs = articles.EN.map((enArt, idx) => ({
    articleId: `art-${enArt.id}`,
    title: {
      EN: enArt.title,
      BN: articles.BN[idx]?.title || enArt.title,
      HI: articles.HI[idx]?.title || enArt.title
    },
    summary: {
      EN: enArt.summary,
      BN: articles.BN[idx]?.summary || enArt.summary,
      HI: articles.HI[idx]?.summary || enArt.summary
    },
    content: {
      EN: enArt.content || enArt.summary,
      BN: articles.BN[idx]?.content || articles.BN[idx]?.summary || enArt.summary,
      HI: articles.HI[idx]?.content || articles.HI[idx]?.summary || enArt.summary
    },
    category: enArt.category || 'world',
    author: enArt.author || 'YUGANTAR Bureau',
    sourceAgency: 'YUGANTAR',
    readTime: enArt.readTime || '3 min read',
    image: enArt.image,
    views: Math.floor(Math.random() * 80 + 20),
    viewsFormatted: enArt.views || '45K',
    trending: enArt.trending || false,
    hero: idx === 0,
    status: 'published'
  }));
  await Article.insertMany(articleDocs);

  console.log('🌱 Seeding Video Reels...');
  const reelDocs = videoReels.EN.map((enReel, idx) => ({
    reelId: `reel-${enReel.id}`,
    title: {
      EN: enReel.title,
      BN: videoReels.BN[idx]?.title || enReel.title,
      HI: videoReels.HI[idx]?.title || enReel.title
    },
    category: enReel.category || 'WORLD',
    videoUrl: enReel.videoUrl,
    thumbnail: enReel.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    duration: enReel.duration || '0:45',
    agency: 'ANI Video Wire',
    likes: enReel.likes || '4.8K',
    shares: enReel.shares || '1.2K'
  }));
  await Reel.insertMany(reelDocs);

  console.log('🌱 Seeding Interactive Poll...');
  await Poll.create({
    pollId: 'daily-poll-1',
    question: {
      EN: 'Should AI regulations be unified globally across international media portals?',
      BN: 'আন্তর্জাতিক সংবাদ সংস্থা জুড়ে কি কৃত্রিম বুদ্ধিমত্তা নিয়ন্ত্রণ একীভূত করা উচিত?',
      HI: 'क्या अंतरराष्ट्रीय मीडिया पोर्टलों पर एआई नियमों को वैश्विक रूप से एकीकृत किया जाना चाहिए?'
    },
    options: [
      { optionId: 'opt-1', text: { EN: 'Yes, mandatory global framework', BN: 'হ্যাঁ, বাধ্যতামূলক কাঠামো', HI: 'हाँ, अनिवार्य वैश्विक ढांचा' }, votes: 1420 },
      { optionId: 'opt-2', text: { EN: 'No, national sovereignty first', BN: 'না, জাতীয় সার্বভৌমত্ব প্রথম', HI: 'नहीं, राष्ट्रीय संप्रभुता पहले' }, votes: 680 },
      { optionId: 'opt-3', text: { EN: 'Undecided / Needs further research', BN: 'অনিশ্চিত / আরও গবেষণা প্রয়োজন', HI: 'अनिर्णित / आगे के शोध की आवश्यकता है' }, votes: 190 }
    ],
    totalVotes: 2290,
    active: true
  });

  console.log('✅ Database Seeding Successfully Completed!');
  console.log('🔑 Default Superadmin Login: admin@yugantar.com / admin123');
};

const runStandaloneSeed = async () => {
  const connectDB = require('./config/db');
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('❌ Cannot seed database because MongoDB connection failed.');
    process.exit(1);
  }
  await seedData();
  process.exit(0);
};

if (require.main === module) {
  runStandaloneSeed();
}

module.exports = { seedData };

