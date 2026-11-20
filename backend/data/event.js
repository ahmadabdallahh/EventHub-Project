const fs = require('node:fs/promises');
const path = require('node:path');

const { randomUUID } = require('node:crypto');

const { NotFoundError } = require('../util/errors');

const DATA_FILE = path.join(__dirname, '..', 'events.json');

// --- File store (local dev fallback) ---

async function fileRead() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function fileWrite(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data));
}

// --- Upstash Redis store (production) ---

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      'Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN environment variables.'
    );
  }
  return { url, token };
}

async function redisGet() {
  const { url, token } = redisConfig();
  const res = await fetch(`${url}/get/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const body = await res.json();
  return body.result === null ? null : JSON.parse(body.result);
}

async function redisSet(value) {
  const { url, token } = redisConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', 'events', JSON.stringify(value)]),
  });
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`Upstash SET failed: ${body.error}`);
}

// --- Store selection ---

const useRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

async function readEvents() {
  if (useRedis) {
    // Seed from events.json the first time the key is missing. Cached so
    // concurrent cold-start invocations share a single seed.
    if (!redisSeeded) {
      redisSeeded = (async () => {
        const existing = await redisGet();
        if (existing === null) {
          const data = await fileRead();
          await redisSet(data.events || []);
        }
      })();
    }
    await redisSeeded;
    return redisGet();
  }
  const data = await fileRead();
  return data.events;
}

let redisSeeded = null;

async function writeEvents(events) {
  if (useRedis) {
    await redisSet(events);
  } else {
    await fileWrite({ events });
  }
}

// --- Public API ---

async function getAll() {
  const events = await readEvents();
  if (!events) {
    throw new NotFoundError('Could not find any events.');
  }
  return events;
}

async function get(id) {
  const events = await readEvents();
  if (!events || events.length === 0) {
    throw new NotFoundError('Could not find any events.');
  }

  const event = events.find((ev) => ev.id === id);
  if (!event) {
    throw new NotFoundError('Could not find event for id ' + id);
  }

  return event;
}

async function add(data) {
  const events = (await readEvents()) || [];
  events.unshift({ ...data, id: randomUUID() });
  await writeEvents(events);
}

async function replace(id, data) {
  const events = await readEvents();
  if (!events || events.length === 0) {
    throw new NotFoundError('Could not find any events.');
  }

  const index = events.findIndex((ev) => ev.id === id);
  if (index < 0) {
    throw new NotFoundError('Could not find event for id ' + id);
  }

  events[index] = { ...data, id };

  await writeEvents(events);
}

async function remove(id) {
  const events = (await readEvents()) || [];
  await writeEvents(events.filter((ev) => ev.id !== id));
}

exports.getAll = getAll;
exports.get = get;
exports.add = add;
exports.replace = replace;
exports.remove = remove;
