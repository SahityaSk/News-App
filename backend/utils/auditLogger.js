const AuditLog = require('../models/AuditLog');

/**
 * Creates an immutable audit log entry in MongoDB
 */
const logAuditAction = async ({ action, actor, targetType, targetId, details, req }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'system';
    const userAgent = req ? req.headers['user-agent'] : 'system';

    await AuditLog.create({
      action,
      actor: {
        email: actor?.email || 'system@yugantar.news',
        role: actor?.role || 'system',
        userId: actor?.id || actor?._id
      },
      targetType: targetType || 'System',
      targetId: targetId ? String(targetId) : undefined,
      details,
      ip,
      userAgent
    });
  } catch (err) {
    console.error(`⚠️ Failed to record audit log (${action}):`, err.message);
  }
};

module.exports = { logAuditAction };
