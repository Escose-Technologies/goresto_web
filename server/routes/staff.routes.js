import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import { createStaffSchema, updateStaffSchema } from '../validators/staff.validator.js';
import * as staffController from '../controllers/staff.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', staffController.getAll);
router.get('/:id', staffController.getById);
router.post('/', validate(createStaffSchema), staffController.create);
router.patch('/:id', validate(updateStaffSchema), staffController.update);
router.delete('/:id', staffController.remove);

export default router;
