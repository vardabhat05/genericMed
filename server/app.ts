import express, { Request, Response } from 'express';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, AppError } from './middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from './constants/http';
import { successResponse } from './utils/response';
import apiRouter from './routes';

export function createApp(): express.Application {
  const app = express();

  // Basic CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  app.use(requestLogger);

  // Health check endpoint
  app.get(['/health', '/api/health'], (req: Request, res: Response) => {
    successResponse(
      res,
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        uptimeSeconds: Math.floor(process.uptime()),
        version: '1.1.0',
        activeNodesLive: 142,
        standards: ['FDA cGMP 21 CFR § 211', 'USP <711> Bioequivalence', 'HL7 FHIR R4'],
      },
      'genericMed API is operational'
    );
  });

  // Mount API v1
  app.use('/api/v1', apiRouter);

  // Handle 404 for unmapped routes
  app.use((req: Request, res: Response, next) => {
    next(
      new AppError(
        `Route ${req.method} ${req.originalUrl} not found on this server.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      )
    );
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
