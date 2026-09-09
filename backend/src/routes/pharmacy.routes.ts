import { Router } from 'express';
import { pharmacyController } from '../controllers/pharmacy.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/pharmacy/inventory - List dispensary stock ledger
router.get('/inventory', (req, res, next) => pharmacyController.getInventory(req, res, next));

// POST /api/v1/pharmacy/scan-stock - Barcode scan stock replenishment
router.post(
  '/scan-stock',
  validateBody([{ field: 'barcode', required: true, type: 'string' }]),
  (req, res, next) => pharmacyController.scanStockBarcode(req, res, next)
);

// GET /api/v1/pharmacy/telemetry - Cold-chain and store node operational telemetry
router.get('/telemetry', (req, res, next) => pharmacyController.getTelemetry(req, res, next));

export default router;
