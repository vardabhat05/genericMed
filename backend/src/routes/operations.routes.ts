import { Router } from 'express';
import { operationsController } from '../controllers/operations.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/operations/exceptions - List operational exceptions
router.get('/exceptions', (req, res, next) => operationsController.getExceptions(req, res, next));

// POST /api/v1/operations/exceptions/:id/resolve - Resolve operational exception
router.post('/exceptions/:id/resolve', (req, res, next) => operationsController.resolveException(req, res, next));

// GET /api/v1/operations/canonical-mappings - List canonical formulary mappings
router.get('/canonical-mappings', (req, res, next) => operationsController.getCanonicalMappings(req, res, next));

// POST /api/v1/operations/canonical-mappings/:id/decision - Approve or reject mapping
router.post(
  '/canonical-mappings/:id/decision',
  validateBody([
    {
      field: 'decision',
      required: true,
      custom: (val) => val === 'approved' || val === 'rejected' || 'Decision must be approved or rejected',
    },
  ]),
  (req, res, next) => operationsController.updateMappingDecision(req, res, next)
);

// POST /api/v1/operations/canonical-mappings - Add new canonical salt
router.post(
  '/canonical-mappings',
  validateBody([
    { field: 'rawSearchTerm', required: true, type: 'string', min: 2 },
  ]),
  (req, res, next) => operationsController.addCanonicalSalt(req, res, next)
);

export default router;
