const { randomInt, createHash, timingSafeEqual } = require('node:crypto');
const { readData, writeData } = require('../data/util');

// 6-digit numeric OTP, 10-minute life, 5 attempts, 60s resend cooldown.
// Stored as SHA-256 hashes in the shared auth store — raw codes never persist.
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashOtp(otp) {
  return createHash('sha256').update(String(otp)).digest('hex');
}

function safeEqualHex(a, b) {
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch (error) {
    return false;
  }
}

// Throws { status: 429 } when called inside the resend cooldown window.
async function requestOtp(email) {
  const data = await readData();
  const store = data.otp || (data.otp = {});
  const now = Date.now();
  const previous = store[email];

  if (previous && now - previous.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - previous.lastSentAt)) / 1000);
    const error = new Error(`Please wait ${waitSec}s before requesting a new code.`);
    error.status = 429;
    throw error;
  }

  const otp = String(randomInt(0, 1000000)).padStart(6, '0');
  store[email] = {
    hash: hashOtp(otp),
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
  };
  await writeData(data);
  return otp;
}

// Single-use: a successful verify deletes the record. Exhausted or
// expired records are deleted too, forcing a fresh /forgot-password.
async function verifyOtp(email, otp) {
  const data = await readData();
  const store = data.otp || (data.otp = {});
  const record = store[email];

  if (!record) {
    return { ok: false, reason: 'expired' };
  }
  if (Date.now() > record.expiresAt) {
    delete store[email];
    await writeData(data);
    return { ok: false, reason: 'expired' };
  }

  record.attempts += 1;
  const match = safeEqualHex(record.hash, hashOtp(otp ?? ''));

  if (!match) {
    const locked = record.attempts >= MAX_ATTEMPTS;
    if (locked) {
      delete store[email];
    }
    await writeData(data);
    return locked
      ? { ok: false, reason: 'locked' }
      : { ok: false, reason: 'invalid', attemptsLeft: MAX_ATTEMPTS - record.attempts };
  }

  delete store[email];
  await writeData(data);
  return { ok: true };
}

exports.requestOtp = requestOtp;
exports.verifyOtp = verifyOtp;
