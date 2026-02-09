import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import { createTableSchema, updateTableSchema } from '../validators/tables.validator.js';
import * as tablesController from '../controllers/tables.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', tablesController.getAll);
router.get('/:id', tablesController.getById);
router.post('/', validate(createTableSchema), tablesController.create);
router.patch('/:id', validate(updateTableSchema), tablesController.update);
router.delete('/:id', tablesController.remove);

export default router;
