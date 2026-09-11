import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as platformHealthController from '../controllers/platformHealth.controller.js';
import * as onboardingController from '../controllers/onboarding.controller.js';

const router = Router();

// Goresto team only. No restaurant_admin may reach this, by design — it
// exposes other restaurants' activity.
router.use(authenticate, authorize('superadmin'));

router.get('/', platformHealthController.overview);
router.get('/onboarding', onboardingController.all);

export default router;
