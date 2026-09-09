import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/orders - List orders (filterable by status)
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));

// GET /api/v1/orders/:id - Get single order details
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));

// POST /api/v1/orders/checkout - Place order and pre-authorize escrow hold
router.post(
  '/checkout',
  validateBody([
    { field: 'patientName', required: true, type: 'string', min: 2 },
    { field: 'items', required: true, type: 'array' },
  ]),
  (req, res, next) => orderController.checkout(req, res, next)
);

// POST /api/v1/orders/:id/verify-item - Pharmacist item verification check
router.post('/:id/verify-item', (req, res, next) => orderController.verifyOrderItem(req, res, next));

// POST /api/v1/orders/:id/pharmacist-signoff - 4-eye pharmacist digital signature
router.post('/:id/pharmacist-signoff', (req, res, next) => orderController.pharmacistSignoff(req, res, next));

// POST /api/v1/orders/:id/courier-handover - Courier PIN handshake and escrow settlement
router.post('/:id/courier-handover', (req, res, next) => orderController.courierHandover(req, res, next));

export default router;
