import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import * as categoriesController from '../controllers/categories.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.patch('/:id', categoriesController.update);
router.delete('/:id', categoriesController.remove);
router.put('/reorder', categoriesController.reorder);

export default router;
