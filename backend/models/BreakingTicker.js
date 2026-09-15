const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const BreakingTickerSchema = new mongoose.Schema({
  tickerId: { type: String, required: true, unique: true },
  title: MultiLangStringSchema,
  category: { type: String, default: 'BREAKING' },
  time: { type: String, default: 'LIVE' },
  urgent: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 1 }
}, {
  timestamps: true
});

module.exports = mongoose.model('BreakingTicker', BreakingTickerSchema);
