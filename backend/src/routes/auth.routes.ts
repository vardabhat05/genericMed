import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

// POST /api/v1/auth/login - Authenticate with email & password
router.post(
  '/login',
  validateBody([
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
  ]),
  (req, res, next) => authController.login(req, res, next)
);

// POST /api/v1/auth/register - Register new account
router.post(
  '/register',
  validateBody([
    { field: 'email', required: true, type: 'string', min: 5 },
    { field: 'password', required: true, type: 'string', min: 6 },
    { field: 'name', required: true, type: 'string', min: 2 },
  ]),
  (req, res, next) => authController.register(req, res, next)
);

// GET /api/v1/auth/me - Authenticated user profile
router.get('/me', authenticate, (req, res, next) => authController.getProfile(req, res, next));

// POST /api/v1/auth/switch-role - Persona switching for demo/admin
router.post(
  '/switch-role',
  authenticate,
  validateBody([{ field: 'role', required: true, type: 'string' }]),
  (req, res, next) => authController.switchRole(req, res, next)
);

// GET /api/v1/auth/personas - Quick reference for pre-seeded persona accounts
router.get('/personas', (req, res, next) => authController.getDemoPersonas(req, res, next));

export default router;
