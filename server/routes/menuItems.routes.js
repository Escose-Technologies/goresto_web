import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema, restaurantAndIdParamSchema } from '../validators/common.validator.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menuItems.validator.js';
import * as menuItemsController from '../controllers/menuItems.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/categories', menuItemsController.getCategories);
router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getById);
router.post('/', validate(createMenuItemSchema), menuItemsController.create);
router.patch('/:id', validate(updateMenuItemSchema), menuItemsController.update);
router.delete('/:id', menuItemsController.remove);

export default router;
