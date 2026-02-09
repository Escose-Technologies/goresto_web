import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createUserSchema, updateUserSchema } from '../validators/users.validator.js';
import * as usersController from '../controllers/users.controller.js';

const router = Router();

router.use(authenticate, authorize('superadmin'));

router.get('/', usersController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), usersController.update);
router.delete('/:id', validate(idParamSchema, 'params'), usersController.remove);

export default router;
