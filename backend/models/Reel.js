const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const ReelSchema = new mongoose.Schema({
  reelId: { type: String, required: true, unique: true },
  title: MultiLangStringSchema,
  category: { type: String, default: 'WORLD' },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  duration: { type: String, default: '0:45' },
  agency: { type: String, default: 'ANI Video Wire' },
  likes: { type: String, default: '4.8K' },
  shares: { type: String, default: '1.2K' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reel', ReelSchema);
