const { randomUUID } = require('node:crypto');
const { sign, verify } = require('jsonwebtoken');
const { compare } = require('bcryptjs');
const { NotAuthError } = require('./errors');
const { readData, writeData } = require('../data/util');

// Set JWT_SECRET in env for production. Dev fallback stays local-only.
const KEY = process.env.JWT_SECRET || 'supersecret';

function createJSONToken(email) {
  return sign({ email }, KEY, { expiresIn: '1h' });
}

function validateJSONToken(token) {
  return verify(token, KEY);
}

// Short-lived token that authorizes ONE password reset. Carries a
// purpose claim so it can never be mistaken for a session token,
// and a unique jti so it can be spent exactly once.
function createPasswordResetToken(email) {
  return sign(
    { email, purpose: 'password-reset', jti: randomUUID() },
    KEY,
    { expiresIn: '15m' }
  );
}

function pruneSpentResetTokens(spent) {
  const now = Date.now();
  for (const [jti, expiresAt] of Object.entries(spent)) {
    if (expiresAt <= now) {
      delete spent[jti];
    }
  }
}

// Check-and-set in one persisted step, so a replayed token is rejected
// before any password work begins. Only callers should use this — the raw
// verifier is deliberately not exported.
async function consumePasswordResetToken(token) {
  const payload = verify(token, KEY);
  if (!payload || payload.purpose !== 'password-reset' || !payload.jti) {
    throw new Error('Invalid reset token.');
  }

  const data = await readData();
  const spent = data.spentResetTokens || (data.spentResetTokens = {});
  pruneSpentResetTokens(spent);
  if (spent[payload.jti]) {
    throw new Error('Reset token has already been used.');
  }

  const expiresAt = payload.exp
    ? payload.exp * 1000
    : Date.now() + 15 * 60 * 1000;
  spent[payload.jti] = expiresAt;
  await writeData(data);
  return payload;
}

// Only called when a reset fails BEFORE the password changes, so a
// transient store error does not force the user to restart the flow.
async function releasePasswordResetToken(payload) {
  if (!payload || !payload.jti) {
    return;
  }
  const data = await readData();
  if (data.spentResetTokens) {
    delete data.spentResetTokens[payload.jti];
    await writeData(data);
  }
}

function isValidPassword(password, storedPassword) {
  return compare(password, storedPassword);
}

function checkAuthMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // Prefer the httpOnly cookie; fall back to `Authorization: Bearer <token>`.
  let authToken = req.cookies && req.cookies.token;
  if (!authToken) {
    if (!req.headers.authorization) {
      return next(new NotAuthError('Not authenticated.'));
    }
    const fragments = req.headers.authorization.split(' ');
    if (fragments.length !== 2) {
      return next(new NotAuthError('Not authenticated.'));
    }
    authToken = fragments[1];
  }

  try {
    const validated = validateJSONToken(authToken);
    // Reset tokens are not session tokens — refuse them here.
    if (validated.purpose) {
      return next(new NotAuthError('Not authenticated.'));
    }
    req.token = validated;
  } catch (error) {
    return next(new NotAuthError('Not authenticated.'));
  }
  next();
}

exports.createJSONToken = createJSONToken;
exports.validateJSONToken = validateJSONToken;
exports.createPasswordResetToken = createPasswordResetToken;
exports.consumePasswordResetToken = consumePasswordResetToken;
exports.releasePasswordResetToken = releasePasswordResetToken;
exports.isValidPassword = isValidPassword;
exports.checkAuth = checkAuthMiddleware;
