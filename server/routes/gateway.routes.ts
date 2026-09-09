import { Router } from 'express';
import { gatewayController } from '../controllers/gateway.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/gateway/clients - List API gateway registered clients
router.get('/clients', (req, res, next) => gatewayController.getClients(req, res, next));

// GET /api/v1/gateway/clients/:id - Get client details
router.get('/clients/:id', (req, res, next) => gatewayController.getClientById(req, res, next));

// GET /api/v1/gateway/events - List Kafka telemetry events
router.get('/events', (req, res, next) => gatewayController.getEvents(req, res, next));

// POST /api/v1/gateway/events/emit - Emit Kafka webhook event simulation
router.post(
  '/events/emit',
  validateBody([{ field: 'topic', required: true, type: 'string' }]),
  (req, res, next) => gatewayController.emitEvent(req, res, next)
);

// POST /api/v1/gateway/test-run - API Explorer test runner
router.post(
  '/test-run',
  validateBody([{ field: 'endpoint', required: true, type: 'string' }]),
  (req, res, next) => gatewayController.runApiExplorerTest(req, res, next)
);

export default router;
