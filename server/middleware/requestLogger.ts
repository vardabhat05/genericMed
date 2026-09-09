import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    // Structured log line
    const color = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`[API] ${method} ${originalUrl} ${color}${statusCode}${reset} - ${duration}ms`);
  });

  next();
}
