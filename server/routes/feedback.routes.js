import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import { createFeedbackSchema } from '../validators/feedback.validator.js';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', feedbackController.listMine);
router.post('/', validate(createFeedbackSchema), feedbackController.create);

export default router;
