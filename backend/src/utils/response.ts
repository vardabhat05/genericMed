import { Response } from 'express';
import { HTTP_STATUS } from '../constants/http';

export interface ApiResponseMeta {
  timestamp: string;
  executionTimeMs?: number;
  [key: string]: any;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
  meta: ApiResponseMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiResponseMeta;
}

export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK,
  meta: Partial<ApiResponseMeta> = {}
): Response {
  const envelope: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return res.status(statusCode).json(envelope);
}

export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: any
): Response {
  const envelope: ApiErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(envelope);
}
