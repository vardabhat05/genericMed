import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';
import { PortalRole } from '../types';

// Extend Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication Middleware: Enforces valid Bearer JWT
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Authentication required. Please provide a valid Bearer token.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyJwt(token);
    req.user = payload;
    next();
  } catch (err: any) {
    throw new AppError(
      `Invalid or expired token: ${err.message}`,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware: Enforces user role
 */
export function requireRole(...allowedRoles: PortalRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        'Authentication required before role verification.',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Forbidden: Role '${req.user.role}' is not authorized to access this clinical endpoint. Required: [${allowedRoles.join(', ')}]`,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    next();
  };
}

/**
 * Optional Authentication: Attaches req.user if token is present without blocking if missing
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyJwt(token);
    } catch {
      // Ignore token failure on optional auth
    }
  }

  next();
}
