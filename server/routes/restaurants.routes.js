import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantOwnership } from '../middleware/restaurantOwnership.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createRestaurantSchema, updateRestaurantSchema, updateProfileSchema } from '../validators/restaurants.validator.js';
import * as restaurantsController from '../controllers/restaurants.controller.js';
import * as subscriptionController from '../controllers/subscription.controller.js';
import * as onboardingController from '../controllers/onboarding.controller.js';
import { restaurantScope } from '../middleware/restaurantScope.js';

const router = Router();

router.use(authenticate);

router.get('/mine', authorize('restaurant_admin', 'superadmin'), restaurantsController.getMine);
router.get('/', authorize('superadmin'), restaurantsController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), restaurantOwnership, restaurantsController.getById);
router.post('/', authorize('superadmin'), validate(createRestaurantSchema), restaurantsController.create);
router.patch('/:id/deactivate', authorize('superadmin'), validate(idParamSchema, 'params'), restaurantsController.deactivate);
router.patch('/:id/activate', authorize('superadmin'), validate(idParamSchema, 'params'), restaurantsController.activate);
router.get('/:id/onboarding', authorize('restaurant_admin', 'superadmin'), validate(idParamSchema, 'params'), restaurantOwnership, onboardingController.mine);

// A restaurant may read its own plan. There is no write path here by design.
router.get('/:id/subscription', authorize('restaurant_admin', 'superadmin'), validate(idParamSchema, 'params'), restaurantOwnership,
  (req, _res, next) => { req.params.restaurantId = req.params.id; next(); }, subscriptionController.mine);

router.patch('/:id/profile', authorize('restaurant_admin', 'superadmin'), validate(idParamSchema, 'params'), validate(updateProfileSchema), restaurantOwnership, restaurantsController.updateProfile);
router.patch('/:id', authorize('restaurant_admin', 'superadmin'), validate(idParamSchema, 'params'), validate(updateRestaurantSchema), restaurantOwnership, restaurantsController.update);
// No hard-delete route: restaurants are suspended (PATCH /:id/deactivate), never destroyed.

export default router;
