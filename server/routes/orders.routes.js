import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import { createOrderSchema, updateOrderSchema, updateOrderStatusSchema } from '../validators/orders.validator.js';
import * as ordersController from '../controllers/orders.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getById);
router.post('/', validate(createOrderSchema), ordersController.create);
router.patch('/:id', validate(updateOrderSchema), ordersController.update);
router.patch('/:id/status', validate(updateOrderStatusSchema), ordersController.updateStatus);
router.delete('/:id', ordersController.remove);

export default router;
