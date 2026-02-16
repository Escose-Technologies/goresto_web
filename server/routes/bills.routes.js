import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import {
  createBillSchema,
  updatePaymentSchema,
  cancelBillSchema,
  previewCalculationSchema,
  billsQuerySchema,
  summaryQuerySchema,
  unbilledOrdersQuerySchema,
} from '../validators/bills.validator.js';
import * as billsController from '../controllers/bills.controller.js';

const router = Router({ mergeParams: true });

// All bill routes require authentication + restaurant admin
router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

// List & query
router.get('/', validate(billsQuerySchema, 'query'), billsController.getAll);
router.get('/unbilled-orders', validate(unbilledOrdersQuerySchema, 'query'), billsController.getUnbilledOrders);
router.get('/next-number', billsController.getNextNumber);
router.get('/summary', validate(summaryQuerySchema, 'query'), billsController.getSummary);

// Preview (read-only calculation, no DB write)
router.post('/preview-calculation', validate(previewCalculationSchema), billsController.previewCalculation);

// CRUD
router.get('/:id', billsController.getById);
router.get('/:id/pdf', billsController.downloadPdf);
router.post('/', validate(createBillSchema), billsController.create);
router.patch('/:id/payment', validate(updatePaymentSchema), billsController.updatePayment);
router.patch('/:id/cancel', validate(cancelBillSchema), billsController.cancel);

export default router;
