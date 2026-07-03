import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import * as staffCallsController from '../controllers/staffCalls.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', staffCallsController.getAll);
router.patch('/read-all', staffCallsController.markAllRead);
router.patch('/:id/read', staffCallsController.markRead);
router.delete('/', staffCallsController.clearAll);

export default router;
