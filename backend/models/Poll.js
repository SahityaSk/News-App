const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const OptionSchema = new mongoose.Schema({
  optionId: { type: String, required: true },
  text: MultiLangStringSchema,
  votes: { type: Number, default: 0 }
}, { _id: false });

const PollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  question: MultiLangStringSchema,
  options: [OptionSchema],
  totalVotes: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Poll', PollSchema);
