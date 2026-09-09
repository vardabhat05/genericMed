import { Router } from 'express';
import { telemetryController } from '../controllers/telemetry.controller';

const router = Router();

// GET /api/v1/telemetry/stream - Live Server-Sent Events (SSE) stream
router.get('/stream', (req, res) => telemetryController.streamEvents(req, res));

// GET /api/v1/telemetry/stats - Active SSE connections & node metrics
router.get('/stats', (req, res) => telemetryController.getStats(req, res));

// POST /api/v1/telemetry/simulate-excursion - Triggers cold-chain excursion alert
router.post('/simulate-excursion', (req, res, next) => telemetryController.simulateExcursion(req, res, next));

export default router;
