import { Router } from 'express';
import { fhirController } from '../controllers/fhir.controller';

const router = Router();

// GET /api/v1/fhir/metadata - FHIR CapabilityStatement
router.get('/metadata', (req, res, next) => fhirController.getMetadata(req, res, next));

// GET /api/v1/fhir/MedicationRequest - Bundle of MedicationRequest resources
router.get('/MedicationRequest', (req, res, next) => fhirController.getMedicationRequests(req, res, next));

// GET /api/v1/fhir/MedicationRequest/:id - Single MedicationRequest
router.get('/MedicationRequest/:id', (req, res, next) => fhirController.getMedicationRequestById(req, res, next));

// GET /api/v1/fhir/MedicationDispense - Bundle of MedicationDispense resources
router.get('/MedicationDispense', (req, res, next) => fhirController.getMedicationDispenses(req, res, next));

export default router;
