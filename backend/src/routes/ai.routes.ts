import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// POST /api/v1/prescriptions/ocr-extract - Extract doctor, NPI, and active salts
router.post(
  '/ocr-extract',
  (req, res, next) => aiController.extractPrescription(req, res, next)
);

// POST /api/v1/prescriptions/normalize-salt - Canonical salt NLP normalizer
router.post(
  '/normalize-salt',
  validateBody([{ field: 'query', required: true, type: 'string' }]),
  (req, res, next) => aiController.normalizeSalt(req, res, next)
);

export default router;
