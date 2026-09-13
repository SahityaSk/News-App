const mongoose = require('mongoose');

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yugantar_news';
  try {
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error (${error.message}). Running with fallback data layer mode.`);
    return false;
  }
};

module.exports = connectDB;
