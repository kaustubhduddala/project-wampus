const crypto = require('crypto');

const DEFAULT_INVITE_EXPIRY_HOURS = 24;

function getInviteExpiryHours() {
  const configured = Number.parseInt(String(process.env.INVITE_EXPIRY_HOURS ?? ''), 10);
  if (Number.isFinite(configured) && configured > 0 && configured <= 168) {
    return configured;
  }
  return DEFAULT_INVITE_EXPIRY_HOURS;
}

function getInviteExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + getInviteExpiryHours());
  return expiresAt;
}

function generateInviteToken() {
  // 64-char hex token from 32 cryptographically random bytes.
  return crypto.randomBytes(32).toString('hex');
}

function hashInviteToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken ?? '')).digest('hex');
}

module.exports = {
  generateInviteToken,
  hashInviteToken,
  getInviteExpiryDate,
  getInviteExpiryHours,
};
