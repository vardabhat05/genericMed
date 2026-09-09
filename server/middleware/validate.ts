import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  custom?: (val: any) => boolean | string;
};

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const val = req.body?.[rule.field];

      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${rule.field}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null) {
        if (rule.type) {
          if (rule.type === 'array' && !Array.isArray(val)) {
            errors.push(`Field '${rule.field}' must be an array.`);
          } else if (rule.type !== 'array' && typeof val !== rule.type) {
            errors.push(`Field '${rule.field}' must be a ${rule.type}.`);
          }
        }

        if (typeof val === 'number') {
          if (rule.min !== undefined && val < rule.min) {
            errors.push(`Field '${rule.field}' must be at least ${rule.min}.`);
          }
          if (rule.max !== undefined && val > rule.max) {
            errors.push(`Field '${rule.field}' must be at most ${rule.max}.`);
          }
        }

        if (typeof val === 'string') {
          if (rule.min !== undefined && val.length < rule.min) {
            errors.push(`Field '${rule.field}' must be at least ${rule.min} characters.`);
          }
        }

        if (rule.custom) {
          const customRes = rule.custom(val);
          if (typeof customRes === 'string') {
            errors.push(customRes);
          } else if (!customRes) {
            errors.push(`Field '${rule.field}' failed custom validation.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new AppError(
        'Validation failed for request body',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        errors
      );
    }

    next();
  };
}
