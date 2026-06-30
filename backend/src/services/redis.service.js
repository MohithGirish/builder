/*
 * redis.service.js — Redis cache helpers with in-memory fallback.
 *
 * Lazily initialises an ioredis client pointing at REDIS_HOST/REDIS_PORT.
 * If Redis is unreachable (e.g. local dev without Docker), all operations
 * silently fall back to a process-level Map with TTL enforcement so the
 * calling code needs no awareness of which backend is in use.
 * Exports: getCache, setCache, delCache, cacheAside (read-through helper), and
 * bumpVersion/getVersion (namespace version counters for bulk invalidation).
 */
'use strict';

let redisClient  = null;
const memCache   = new Map();
const MEM_MAX    = 500; // ponytail: cap on the no-Redis fallback Map; sweep expired keys when exceeded

function sweepExpired() {
  const now = Date.now();
  for (const [k, e] of memCache) if (e.expiresAt <= now) memCache.delete(k);
}

function getRedisClient() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_HOST) return null; // no Redis configured — use in-memory fallback
  try {
    const Redis = require('ioredis');
    const host  = process.env.REDIS_HOST;
    const port  = parseInt(process.env.REDIS_PORT, 10) || 6379;
    redisClient = new Redis({
      host,
      port,
      lazyConnect:         true,
      enableOfflineQueue:  false,
      connectTimeout:      2000,
      maxRetriesPerRequest: 1,
    });
    redisClient.on('error', () => {}); // suppress reconnection noise
    return redisClient;
  } catch {
    return null;
  }
}

async function getCache(key) {
  const client = getRedisClient();
  if (client) {
    try {
      const val = await client.get(key);
      return val ? JSON.parse(val) : null;
    } catch { /* fall through to in-memory */ }
  }
  const entry = memCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;
  memCache.delete(key);
  return null;
}

async function setCache(key, value, ttlSeconds) {
  const client = getRedisClient();
  if (client) {
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch { /* fall through to in-memory */ }
  }
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (memCache.size > MEM_MAX) sweepExpired(); // reclaim stale version-stamped & expired keys
}

async function delCache(key) {
  const client = getRedisClient();
  if (client) {
    try { await client.del(key); } catch { /* fall through */ }
  }
  memCache.delete(key);
}

/**
 * Read-through cache: return the cached value for `key`, or run `producer()`,
 * cache its result for `ttlSeconds`, and return it. null/undefined producer
 * results are NOT cached (a cache miss and a cached-null are indistinguishable
 * through getCache, so we never persist an empty result).
 */
const _inflight = new Map(); // key -> Promise — coalesces concurrent misses (no thundering herd)

async function cacheAside(key, ttlSeconds, producer) {
  const cached = await getCache(key);
  if (cached !== null && cached !== undefined) return cached;
  if (_inflight.has(key)) return _inflight.get(key);

  const p = (async () => {
    const value = await producer();
    if (value !== null && value !== undefined) await setCache(key, value, ttlSeconds);
    return value;
  })();
  _inflight.set(key, p);
  try   { return await p; }
  finally { _inflight.delete(key); }
}

// ── Namespace version counters ───────────────────────────────────────────────
// Embed getVersion(ns) in a cache key; bumpVersion(ns) on a write makes every
// key built from the old version unreachable (and it expires via TTL). This is
// O(1) bulk invalidation without needing SCAN/KEYS over the keyspace.
const VERSION_TTL = 7 * 24 * 60 * 60; // 7 days

async function getVersion(ns) {
  return (await getCache(`ver:${ns}`)) || 1;
}

async function bumpVersion(ns) {
  await setCache(`ver:${ns}`, Date.now(), VERSION_TTL);
}

module.exports = { getCache, setCache, delCache, cacheAside, getVersion, bumpVersion };
