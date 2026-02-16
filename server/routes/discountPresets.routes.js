import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import {
  createDiscountPresetSchema,
  updateDiscountPresetSchema,
} from '../validators/discountPresets.validator.js';
import * as discountPresetsController from '../controllers/discountPresets.controller.js';

const router = Router({ mergeParams: true });

// All discount preset routes require authentication + restaurant admin
router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', discountPresetsController.getAll);
router.get('/active', discountPresetsController.getActive);
router.get('/:id', discountPresetsController.getById);
router.post('/', validate(createDiscountPresetSchema), discountPresetsController.create);
router.patch('/:id', validate(updateDiscountPresetSchema), discountPresetsController.update);
router.delete('/:id', discountPresetsController.remove);

export default router;
