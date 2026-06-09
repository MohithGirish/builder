/*
 * redis.service.js — Redis cache helpers with in-memory fallback.
 *
 * Lazily initialises an ioredis client pointing at REDIS_HOST/REDIS_PORT.
 * If Redis is unreachable (e.g. local dev without Docker), all operations
 * silently fall back to a process-level Map with TTL enforcement so the
 * calling code needs no awareness of which backend is in use.
 * Exports: getCache(key), setCache(key, value, ttlSeconds).
 */
'use strict';

let redisClient  = null;
const memCache   = new Map();

function getRedisClient() {
  if (redisClient) return redisClient;
  try {
    const Redis = require('ioredis');
    const host  = process.env.REDIS_HOST || 'localhost';
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
}

module.exports = { getCache, setCache };
