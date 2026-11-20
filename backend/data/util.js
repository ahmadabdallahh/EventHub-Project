const fs = require('node:fs/promises');
const path = require('node:path');

// Each store lives in one Upstash key. Local dev falls back to JSON files
// when Redis env vars are absent.
const STORES = {
  'auth-data': {
    key: 'auth-data',
    file: path.join(__dirname, '..', 'auth-data.json'),
    empty: () => ({ users: [], otp: {}, spentResetTokens: {} }),
  },
  attendance: {
    key: 'attendance',
    file: path.join(__dirname, '..', 'attendance.json'),
    empty: () => ({}),
  },
};

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(url && token);

function normalise(storeName, data) {
  return { ...STORES[storeName].empty(), ...(data || {}) };
}

async function localRead(storeName) {
  const file = STORES[storeName].file;
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      const empty = STORES[storeName].empty();
      await localWrite(storeName, empty);
      return empty;
    }
    throw error;
  }
}

async function localWrite(storeName, data) {
  await fs.writeFile(STORES[storeName].file, JSON.stringify(data));
}

async function redisGet(storeName) {
  const res = await fetch(`${url}/get/${STORES[storeName].key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`Upstash GET failed: ${body.error}`);
  return body.result === null ? null : JSON.parse(body.result);
}

async function redisSet(storeName, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', STORES[storeName].key, JSON.stringify(data)]),
  });
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`Upstash SET failed: ${body.error}`);
}

async function readStore(storeName) {
  if (useRedis) {
    const data = await redisGet(storeName);
    if (data === null) {
      const empty = STORES[storeName].empty();
      await redisSet(storeName, empty);
      return empty;
    }
    return normalise(storeName, data);
  }
  return normalise(storeName, await localRead(storeName));
}

async function writeStore(storeName, data) {
  if (useRedis) {
    await redisSet(storeName, data);
  } else {
    await localWrite(storeName, data);
  }
}

const readData = () => readStore('auth-data');
const writeData = (data) => writeStore('auth-data', data);

exports.readStore = readStore;
exports.writeStore = writeStore;
exports.readData = readData;
exports.writeData = writeData;
