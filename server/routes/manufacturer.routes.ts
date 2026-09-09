import { Router } from 'express';
import { manufacturerController } from '../controllers/manufacturer.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/manufacturers/dossiers - List regulatory dossiers
router.get('/dossiers', (req, res, next) => manufacturerController.getDossiers(req, res, next));

// GET /api/v1/manufacturers/dossiers/:id - Get dossier by ID
router.get('/dossiers/:id', (req, res, next) => manufacturerController.getDossierById(req, res, next));

// GET /api/v1/manufacturers/rfqs - List open dispensary volume RFQs
router.get('/rfqs', (req, res, next) => manufacturerController.getRfqs(req, res, next));

// POST /api/v1/manufacturers/rfqs/:id/bid - Place competitive price bid on RFQ
router.post(
  '/rfqs/:id/bid',
  validateBody([
    { field: 'bidPrice', required: true, min: 0.001 },
  ]),
  (req, res, next) => manufacturerController.placeBid(req, res, next)
);

export default router;
