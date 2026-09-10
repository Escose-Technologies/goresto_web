import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { feedbackQuerySchema, updateFeedbackSchema } from '../validators/feedback.validator.js';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = Router();

// The Goresto team's inbox — superadmin only.
router.use(authenticate, authorize('superadmin'));

router.get('/', validate(feedbackQuerySchema, 'query'), feedbackController.listAll);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateFeedbackSchema), feedbackController.update);

export default router;
