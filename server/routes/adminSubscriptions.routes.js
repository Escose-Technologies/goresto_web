import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  updateSubscriptionSchema, restartTrialSchema, recordPaymentSchema, freeSlotsSchema,
} from '../validators/subscription.validator.js';
import * as controller from '../controllers/subscription.controller.js';

const router = Router();

// Goresto team only. Nothing here is reachable by a restaurant.
router.use(authenticate, authorize('superadmin'));

router.get('/', controller.listAll);
router.patch('/free-slots', validate(freeSlotsSchema), controller.setFreeSlots);
router.get('/:restaurantId/events', controller.events);
router.patch('/:restaurantId', validate(updateSubscriptionSchema), controller.update);
router.post('/:restaurantId/restart-trial', validate(restartTrialSchema), controller.restartTrial);
router.post('/:restaurantId/payments', validate(recordPaymentSchema), controller.recordPayment);

export default router;
