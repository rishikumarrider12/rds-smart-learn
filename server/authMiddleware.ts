import { Request, Response, NextFunction } from 'express';
import { cloudDb, DbUser, UserRole } from './db.js';

export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  token?: string;
}

/**
 * Extracts session token from either Authorization header or secure cookie
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    if (headerToken) return headerToken;
  }

  // 2. Check httpOnly Cookie (cookie-parser populated)
  if ((req as any).cookies && typeof (req as any).cookies.rds_session_token === 'string') {
    const cookieToken = (req as any).cookies.rds_session_token.trim();
    if (cookieToken) return cookieToken;
  }

  return null;
}

/**
 * Middleware to authenticate requests using Token / Session
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = cloudDb.findSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  if (session.user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact the RDS administrator.' });
  }

  if (session.user.status === 'inactive') {
    return res.status(403).json({ error: 'Your account is currently inactive. Please contact the RDS administrator.' });
  }

  req.user = session.user;
  req.token = token;
  next();
}

/**
 * Optional Authentication: Attaches user if valid session exists, but doesn't block unauthenticated requests
 */
export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);
  if (token) {
    const session = cloudDb.findSession(token);
    if (session && session.user.status === 'active') {
      req.user = session.user;
      req.token = token;
    }
  }
  next();
}

/**
 * Role-Based Access Control middleware
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

/**
 * Sanitizes user for client response (removes passwordHash and salt)
 */
export function sanitizeUser(user: DbUser) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}
