import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import restaurantsRoutes from './restaurants.routes.js';
import menuItemsRoutes from './menuItems.routes.js';
import tablesRoutes from './tables.routes.js';
import ordersRoutes from './orders.routes.js';
import staffRoutes from './staff.routes.js';
import settingsRoutes from './settings.routes.js';
import reviewsRoutes from './reviews.routes.js';
import analyticsRoutes from './analytics.routes.js';
import billsRoutes from './bills.routes.js';
import discountPresetsRoutes from './discountPresets.routes.js';
import publicRoutes from './public.routes.js';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Admin endpoints
router.use('/users', usersRoutes);
router.use('/restaurants', restaurantsRoutes);

// Restaurant-scoped endpoints
router.use('/restaurants/:restaurantId/menu-items', menuItemsRoutes);
router.use('/restaurants/:restaurantId/tables', tablesRoutes);
router.use('/restaurants/:restaurantId/orders', ordersRoutes);
router.use('/restaurants/:restaurantId/staff', staffRoutes);
router.use('/restaurants/:restaurantId/settings', settingsRoutes);
router.use('/restaurants/:restaurantId/reviews', reviewsRoutes);
router.use('/restaurants/:restaurantId/analytics', analyticsRoutes);
router.use('/restaurants/:restaurantId/bills', billsRoutes);
router.use('/restaurants/:restaurantId/discount-presets', discountPresetsRoutes);

// Public endpoints (no auth)
router.use('/public/restaurants', publicRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
