import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import { createReviewSchema } from '../validators/reviews.validator.js';
import { publicOrderLimiter } from '../config/rateLimiter.js';
import * as publicController from '../controllers/public.controller.js';
import { z } from 'zod';

const router = Router();

const publicOrderSchema = z.object({
  tableNumber: z.string().min(1).max(20).trim(),
  items: z.array(z.object({
    menuItemId: z.string().min(1),
    name: z.string().min(1).max(200),
    quantity: z.number().int().positive().max(100),
    price: z.number().nonnegative().max(99999.99),
  })).min(1).max(50),
  total: z.number().nonnegative().max(999999.99),
  customerName: z.string().min(1, 'Name is required').max(200).trim(),
  customerMobile: z.string().min(5, 'Mobile number is required').max(20).trim(),
  notes: z.string().max(500).optional().default(''),
});

// All public routes are under /api/public/restaurants/:restaurantId
router.get('/:restaurantId', validate(restaurantIdParamSchema, 'params'), publicController.getRestaurant);
router.get('/:restaurantId/menu', validate(restaurantIdParamSchema, 'params'), publicController.getMenu);
router.get('/:restaurantId/menu/categories', validate(restaurantIdParamSchema, 'params'), publicController.getCategories);
router.get('/:restaurantId/settings', validate(restaurantIdParamSchema, 'params'), publicController.getSettings);
router.post('/:restaurantId/orders', publicOrderLimiter, validate(restaurantIdParamSchema, 'params'), validate(publicOrderSchema), publicController.placeOrder);
router.get('/:restaurantId/orders/status', validate(restaurantIdParamSchema, 'params'), publicController.checkOrderStatus);
router.post('/:restaurantId/reviews', validate(restaurantIdParamSchema, 'params'), validate(createReviewSchema), publicController.submitReview);
router.get('/:restaurantId/menu-items/:menuItemId/reviews', validate(restaurantIdParamSchema, 'params'), publicController.getMenuItemReviews);
router.post('/:restaurantId/kitchen/verify-pin', validate(restaurantIdParamSchema, 'params'), publicController.verifyKitchenPin);

export default router;
