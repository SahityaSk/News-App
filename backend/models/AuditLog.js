const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  actor: {
    email: { type: String, required: true },
    role: { type: String, default: 'anonymous' },
    userId: { type: String }
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Article', 'BreakingTicker', 'LiveStream', 'Reel', 'Poll', 'Subscriber', 'Admin', 'System'],
    index: true
  },
  targetId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  correlationId: { type: String },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
