import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', notificationsController.getAll);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);
router.delete('/', notificationsController.clearAll);

export default router;
