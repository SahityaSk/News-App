const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const LiveStreamSchema = new mongoose.Schema({
  streamId: { type: String, required: true, unique: true },
  title: MultiLangStringSchema,
  summary: MultiLangStringSchema,
  channelName: { type: String, default: 'YUGANTAR Live 24/7' },
  streamType: { type: String, enum: ['youtube_live', 'web_embed', 'hls_m3u8', 'mp4'], default: 'youtube_live' },
  videoUrl: { type: String, required: true },
  viewers: { type: String, default: '14.2K' },
  isLive: { type: Boolean, default: true },
  chatEnabled: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('LiveStream', LiveStreamSchema);
