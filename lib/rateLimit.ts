import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 300000);
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
 * In-memory sliding window rate limiter
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    // New window
    rateLimitStore.set(key, {
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
 * Returns HTTP 429 response
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
