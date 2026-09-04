import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding rate limit store
const ipStore = new Map<string, RateLimitRecord>();
const emailStore = new Map<string, RateLimitRecord>();
const userAiStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipStore.entries()) {
    if (now > record.resetTime) ipStore.delete(key);
  }
  for (const [key, record] of emailStore.entries()) {
    if (now > record.resetTime) emailStore.delete(key);
  }
  for (const [key, record] of userAiStore.entries()) {
    if (now > record.resetTime) userAiStore.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Helper to extract client IP address reliably
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Generic Rate Limiting Middleware
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIp(req);

    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', options.maxRequests - 1);
      return next();
    }

    if (record.count >= options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: options.message,
        retryAfter: retryAfterSec,
      });
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - record.count));
    next();
  };
}

/**
 * 1. Forgot Password Limiter
 * Limits requests per IP (max 5 per 15 min) and per Email (max 3 per 15 min)
 */
export function forgotPasswordRateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = getClientIp(req);
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxIpRequests = 5;
  const maxEmailRequests = 3;

  // Check IP limit
  const ipRecord = ipStore.get(ip);
  if (ipRecord && now < ipRecord.resetTime && ipRecord.count >= maxIpRequests) {
    const retryAfterSec = Math.ceil((ipRecord.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Too many password reset requests from this IP address. Please wait before trying again.',
      retryAfter: retryAfterSec,
    });
  }

  // Check Email limit
  if (email) {
    const emailRecord = emailStore.get(email);
    if (emailRecord && now < emailRecord.resetTime && emailRecord.count >= maxEmailRequests) {
      const retryAfterSec = Math.ceil((emailRecord.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: 'Too many password reset requests for this email address. Please check your inbox or wait before trying again.',
        retryAfter: retryAfterSec,
      });
    }
  }

  // Record attempt on IP
  if (!ipRecord || now > ipRecord.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    ipRecord.count += 1;
  }

  // Record attempt on Email
  if (email) {
    const emailRecord = emailStore.get(email);
    if (!emailRecord || now > emailRecord.resetTime) {
      emailStore.set(email, { count: 1, resetTime: now + windowMs });
    } else {
      emailRecord.count += 1;
    }
  }

  next();
}

/**
 * 2. Login Rate Limiter (Brute-force protection)
 * Limits failed login attempts per IP and per Email (max 5 per 5 minutes)
 */
const failedLoginStore = new Map<string, RateLimitRecord>();

export function trackFailedLogin(req: Request, email?: string) {
  const now = Date.now();
  const ip = getClientIp(req);
  const windowMs = 5 * 60 * 1000; // 5 minutes

  const ipKey = `ip_${ip}`;
  const ipRecord = failedLoginStore.get(ipKey);
  if (!ipRecord || now > ipRecord.resetTime) {
    failedLoginStore.set(ipKey, { count: 1, resetTime: now + windowMs });
  } else {
    ipRecord.count += 1;
  }

  if (email) {
    const emailKey = `email_${email.trim().toLowerCase()}`;
    const emailRecord = failedLoginStore.get(emailKey);
    if (!emailRecord || now > emailRecord.resetTime) {
      failedLoginStore.set(emailKey, { count: 1, resetTime: now + windowMs });
    } else {
      emailRecord.count += 1;
    }
  }
}

export function clearFailedLogin(req: Request, email?: string) {
  const ip = getClientIp(req);
  failedLoginStore.delete(`ip_${ip}`);
  if (email) {
    failedLoginStore.delete(`email_${email.trim().toLowerCase()}`);
  }
}

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = getClientIp(req);
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  const maxAttempts = 5;

  const ipKey = `ip_${ip}`;
  const ipRecord = failedLoginStore.get(ipKey);
  if (ipRecord && now < ipRecord.resetTime && ipRecord.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((ipRecord.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Too many failed login attempts from this network. Please wait 5 minutes before trying again.',
      retryAfter: retryAfterSec,
    });
  }

  if (email) {
    const emailKey = `email_${email}`;
    const emailRecord = failedLoginStore.get(emailKey);
    if (emailRecord && now < emailRecord.resetTime && emailRecord.count >= maxAttempts) {
      const retryAfterSec = Math.ceil((emailRecord.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: 'Too many failed login attempts for this account. Please wait 5 minutes before trying again.',
        retryAfter: retryAfterSec,
      });
    }
  }

  next();
}

/**
 * 3. AI Generation Burst Rate Limiter
 * Restricts rapid automated bursts (max 30 requests/minute per authenticated user)
 */
export function aiBurstLimiter(req: any, res: Response, next: NextFunction) {
  const userId = req.user?.id || getClientIp(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxBurst = 30; // 30 requests per minute

  const record = userAiStore.get(userId);
  if (!record || now > record.resetTime) {
    userAiStore.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxBurst) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'AI request rate limit reached. Please pause a moment before generating more questions or answers.',
      retryAfter: retryAfterSec,
    });
  }

  record.count += 1;
  next();
}
