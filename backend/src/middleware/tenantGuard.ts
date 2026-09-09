import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export function enforceTenantScope(resourceNodeIdGetter?: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    // Operations admins have global oversight
    if (req.user.role === 'operations') {
      return next();
    }

    if (resourceNodeIdGetter) {
      const targetNodeId = resourceNodeIdGetter(req);
      if (targetNodeId && req.user.nodeId && targetNodeId !== req.user.nodeId) {
        throw new AppError(
          `Tenant Isolation Violation: Authenticated node '${req.user.nodeId}' cannot access resources belonging to node '${targetNodeId}'.`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        );
      }
    }

    next();
  };
}
