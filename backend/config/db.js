const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const customUri = process.env.MONGODB_URI;

  // 1. If explicit MONGODB_URI is provided in .env, connect to it
  if (customUri && customUri.trim() !== '') {
    try {
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`🍃 MongoDB Connected (Cloud/URI): ${conn.connection.host} / ${conn.connection.name}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ MONGODB_URI Connection Error (${error.message}). Attempting local/in-memory fallback...`);
    }
  }

  // 2. Try connecting to local MongoDB daemon (mongodb://127.0.0.1:27017)
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/yugantar_news', {
      serverSelectionTimeoutMS: 1500 // Quick timeout check
    });
    console.log(`🍃 MongoDB Connected (Local): ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.log(`ℹ️ Local MongoDB daemon not active on port 27017. Initializing In-Memory MongoDB...`);
  }

  // 3. In-Memory MongoDB fallback (no installation or external service required)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri, {
      dbName: 'yugantar_news'
    });
    console.log(`🍃 MongoDB In-Memory Server Started & Connected! (${conn.connection.host})`);

    // Auto-seed in-memory database
    try {
      const { seedData } = require('../seed');
      if (typeof seedData === 'function') {
        await seedData();
      }
    } catch (seedErr) {
      console.log(`ℹ️ Auto-seed info: ${seedErr.message}`);
    }

    return true;
  } catch (memError) {
    console.warn(`⚠️ In-Memory MongoDB setup failed (${memError.message}). Operating in Mock Data Layer mode.`);
    return false;
  }
};

module.exports = connectDB;


