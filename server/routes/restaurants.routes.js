import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurants.validator.js';
import * as restaurantsController from '../controllers/restaurants.controller.js';

const router = Router();

router.use(authenticate);

router.get('/mine', authorize('restaurant_admin', 'superadmin'), restaurantsController.getMine);
router.get('/', authorize('superadmin'), restaurantsController.getAll);
router.get('/:id', restaurantsController.getById);
router.post('/', authorize('superadmin'), validate(createRestaurantSchema), restaurantsController.create);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateRestaurantSchema), restaurantsController.update);
router.delete('/:id', authorize('superadmin'), validate(idParamSchema, 'params'), restaurantsController.remove);

export default router;
