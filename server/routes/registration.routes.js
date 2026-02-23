import { Router } from 'express';
import { authLimiter } from '../config/rateLimiter.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../validators/registration.validator.js';
import * as controller from '../controllers/registration.controller.js';

const router = Router();

// Public
router.post('/register', authLimiter, validate(registerSchema), controller.register);

// Super Admin only
router.get('/pending', authenticate, authorize('superadmin'), controller.getPending);
router.patch('/:id/approve', authenticate, authorize('superadmin'), controller.approve);
router.patch('/:id/reject', authenticate, authorize('superadmin'), controller.reject);

export default router;
