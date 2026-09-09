import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http';
import { errorResponse } from '../utils/response';

interface RateLimitWindow {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  windowMs?: number; // window size in ms, default 60000 (1 min)
  max?: number;      // max requests per window, default 100
}

export class SlidingWindowRateLimiter {
  private tracker: Map<string, RateLimitWindow> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: RateLimitOptions = {}) {
    this.windowMs = options.windowMs || 60 * 1000;
    this.maxRequests = options.max || 100;

    // Periodic cleanup of expired windows
    setInterval(() => this.cleanup(), this.windowMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.tracker.entries()) {
      if (now > record.resetTime) {
        this.tracker.delete(key);
      }
    }
  }

  public check(identifier: string, customLimit?: number): { allowed: boolean; limit: number; remaining: number; resetTime: number } {
    const limit = customLimit || this.maxRequests;
    const now = Date.now();
    let record = this.tracker.get(identifier);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + this.windowMs };
      this.tracker.set(identifier, record);
      return { allowed: true, limit, remaining: limit - 1, resetTime: record.resetTime };
    }

    record.count++;
    const remaining = Math.max(0, limit - record.count);
    const allowed = record.count <= limit;

    return { allowed, limit, remaining, resetTime: record.resetTime };
  }

  public reset(identifier: string): void {
    this.tracker.delete(identifier);
  }
}

export const defaultRateLimiter = new SlidingWindowRateLimiter({ windowMs: 60 * 1000, max: 120 });

export const rateLimiterMiddleware = (limiter: SlidingWindowRateLimiter = defaultRateLimiter) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip rate-limiting for health probes and static metrics
    if (req.path.startsWith('/health') || req.path === '/metrics') {
      return next();
    }

    // Determine client identifier: API key header > Auth Bearer User > IP address
    const apiKey = req.headers['x-api-key'] as string;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const identifier = apiKey ? `key:${apiKey}` : `ip:${ip}`;

    // Elevate limit for authenticated API gateway partner keys
    const limit = apiKey ? 1000 : 120;
    const status = limiter.check(identifier, limit);

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', status.limit.toString());
    res.setHeader('RateLimit-Remaining', status.remaining.toString());
    res.setHeader('RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString());

    if (!status.allowed) {
      res.setHeader('Retry-After', Math.ceil((status.resetTime - Date.now()) / 1000).toString());
      errorResponse(
        res,
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many requests. You have exceeded your rate limit. Please retry after the reset window.',
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
      return;
    }

    next();
  };
};
