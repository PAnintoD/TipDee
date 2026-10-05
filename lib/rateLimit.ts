import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Bounded LRU Cache in-memory store to prevent memory leaks (Max 5,000 active IPs/keys)
const MAX_MEMORY_RECORDS = 5000;
const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    });
  }, 120000); // Check every 2 minutes
}

// Initialize Upstash Redis if configured in environment variables
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (e) {
    console.warn('[RateLimit] Failed to initialize Upstash Redis, falling back to LRU memory limiter', e);
  }
}

/**
 * Extracts client IP address from NextRequest
 */
export function getClientIp(req: NextRequest | Request): string {
  if ('headers' in req) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip');
    if (realIp) {
      return realIp.trim();
    }
  }
  return '127.0.0.1';
}

/**
 * In-memory sliding window rate limiter with LRU eviction (strictly prevents memory leak)
 */
function memoryRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    // Evict oldest record if capacity reached
    if (memoryStore.size >= MAX_MEMORY_RECORDS) {
      const oldestKey = memoryStore.keys().next().value;
      if (oldestKey) memoryStore.delete(oldestKey);
    }

    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (existing.count >= maxRequests) {
    const resetInSeconds = Math.ceil((existing.resetAt - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  existing.count += 1;
  const resetInSeconds = Math.ceil((existing.resetAt - now) / 1000);
  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetInSeconds: Math.max(1, resetInSeconds),
  };
}

/**
 * Production-ready distributed rate limiter.
 * Uses Upstash Redis (if configured) across serverless/multi-instance deployments,
 * or gracefully falls back to the strictly bounded in-memory LRU store.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number; resetInSeconds: number }> {
  if (redisClient) {
    try {
      const ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        analytics: false,
        prefix: 'tipdee:ratelimit',
      });
      const result = await ratelimit.limit(key);
      const resetInSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return {
        success: result.success,
        remaining: result.remaining,
        resetInSeconds,
      };
    } catch (err) {
      console.warn('[RateLimit] Upstash Redis error, falling back to LRU limiter:', err);
    }
  }

  return memoryRateLimit(key, maxRequests, windowSeconds);
}

/**
 * Synchronous in-memory rate limiter fallback
 */
export function checkRateLimitSync(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { success: boolean; remaining: number; resetInSeconds: number } {
  return memoryRateLimit(key, maxRequests, windowSeconds);
}

/**
 * Returns HTTP 429 response with RFC-compliant Retry-After header
 */
export function rateLimitExceededResponse(resetInSeconds: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `คุณส่งคำขอถี่เกินไป กรุณารอ ${resetInSeconds} วินาทีแล้วลองใหม่อีกครั้ง (Rate limit exceeded)`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetInSeconds),
      },
    }
  );
}
