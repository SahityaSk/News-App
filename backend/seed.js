require('dotenv').config();
const connectDB = require('./config/db');
const Article = require('./models/Article');
const BreakingTicker = require('./models/BreakingTicker');
const LiveStream = require('./models/LiveStream');
const Reel = require('./models/Reel');
const Poll = require('./models/Poll');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const { TEMPORARY_LIVE_STREAM_URL, inferStreamType } = require('./config/media');

const seedDatabase = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('❌ Cannot seed database because MongoDB connection failed.');
    process.exit(1);
  }

  console.log('🧹 Removing legacy demo articles, tickers, and reels only...');
  await Promise.all([
    Article.deleteMany({ articleId: { $in: ['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-art-1', 'art-art-2', 'art-art-3', 'art-art-4', 'art-art-5', 'art-art-6'] } }),
    BreakingTicker.deleteMany({ tickerId: { $in: ['ticker-b1', 'ticker-b2', 'ticker-b3', 'ticker-b4', 'ticker-b5'] } }),
    Reel.deleteMany({ reelId: { $in: ['reel-v1', 'reel-v2'] } })
  ]);

  console.log('🌱 Ensuring Admin User exists...');
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedAdminEmail || !seedAdminPassword) {
    console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before seeding an admin account.');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(seedAdminPassword, salt);
  await Admin.findOneAndUpdate(
    { email: seedAdminEmail.toLowerCase() },
    { name: 'Chief Editor', email: seedAdminEmail.toLowerCase(), passwordHash, role: 'superadmin' },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('🌱 Configuring temporary official Bengali live stream...');
  await LiveStream.findOneAndUpdate({ streamId: 'hero-live-stream' }, {
    streamId: 'hero-live-stream',
    title: {
      EN: 'Live Bengali News Stream',
      BN: 'বাংলা লাইভ সংবাদ সম্প্রচার',
      HI: 'लाइव बंगाली समाचार प्रसारण'
    },
    summary: {
      EN: 'Temporary official ABP Ananda live feed. Replace this from the Editorial Desk when the client stream is available.',
      BN: 'সাময়িকভাবে অফিসিয়াল ABP আনন্দ লাইভ ফিড দেখানো হচ্ছে। ক্লায়েন্টের স্ট্রিম পেলে Editorial Desk থেকে পরিবর্তন করুন।',
      HI: 'फिलहाल आधिकारिक ABP आनंद लाइव फीड दिखाया जा रहा है। क्लाइंट का स्ट्रीम मिलने पर Editorial Desk से बदलें।'
    },
    channelName: 'ABP Ananda Official Live',
    streamType: inferStreamType(TEMPORARY_LIVE_STREAM_URL),
    videoUrl: TEMPORARY_LIVE_STREAM_URL,
    viewers: 'Live',
    isLive: true
  }, { upsert: true, returnDocument: 'after' });

  console.log('🌱 Ensuring Interactive Poll exists...');
  await Poll.findOneAndUpdate({ pollId: 'daily-poll-1' }, {
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
  }, { upsert: true, returnDocument: 'after' });

  console.log('✅ Database Seeding Successfully Completed!');
  console.log(`🔑 Seeded superadmin account: ${seedAdminEmail.toLowerCase()}`);
  process.exit(0);
};

seedDatabase();
