const fs = require('node:fs/promises');
const path = require('node:path');

// Auth state (users, OTPs, spent reset tokens) lives in one Upstash key.
// Local dev falls back to a JSON file when Redis env vars are absent.
const STORE_KEY = 'auth-data';
const LOCAL_FILE = path.join(__dirname, '..', 'auth-data.json');

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(url && token);

function emptyData() {
  return { users: [], otp: {}, spentResetTokens: {} };
}

function normalise(data) {
  return { ...emptyData(), ...(data || {}) };
}

async function localRead() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      const empty = emptyData();
      await localWrite(empty);
      return empty;
    }
    throw error;
  }
}

async function localWrite(data) {
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data));
}

async function redisGet() {
  const res = await fetch(`${url}/get/${STORE_KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`Upstash GET failed: ${body.error}`);
  return body.result === null ? null : JSON.parse(body.result);
}

async function redisSet(data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', STORE_KEY, JSON.stringify(data)]),
  });
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`Upstash SET failed: ${body.error}`);
}

async function readData() {
  if (useRedis) {
    const data = await redisGet();
    if (data === null) {
      const empty = emptyData();
      await redisSet(empty);
      return empty;
    }
    return normalise(data);
  }
  return normalise(await localRead());
}

async function writeData(data) {
  if (useRedis) {
    await redisSet(data);
  } else {
    await localWrite(data);
  }
}

exports.readData = readData;
exports.writeData = writeData;
