import { Router } from 'express';
import { medicineController } from '../controllers/medicine.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/medicines - List/search medicines
router.get('/', (req, res, next) => medicineController.getMedicines(req, res, next));

// GET /api/v1/medicines/:id - Retrieve single medicine with dissolution curve
router.get('/:id', (req, res, next) => medicineController.getMedicineById(req, res, next));

// POST /api/v1/medicines/bioequivalent-search - Search bioequivalent substitutes
router.post(
  '/bioequivalent-search',
  validateBody([{ field: 'query_brand', required: false }, { field: 'query', required: false }]),
  (req, res, next) => medicineController.searchBioequivalent(req, res, next)
);

export default router;
