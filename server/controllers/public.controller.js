import { asyncHandler } from '../utils/asyncHandler.js';
import * as restaurantsService from '../services/restaurants.service.js';
import * as menuItemsService from '../services/menuItems.service.js';
import * as settingsService from '../services/settings.service.js';
import * as ordersService from '../services/orders.service.js';
import * as reviewsService from '../services/reviews.service.js';
import { emitOrderCreated } from '../utils/socketEmitter.js';

import { prisma } from '../config/database.js';

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.getById(req.params.restaurantId);
  // Return only public-safe fields
  const { adminId, ...publicData } = restaurant;
  res.json({ success: true, data: publicData });
});

export const getMenu = asyncHandler(async (req, res) => {
  const items = await menuItemsService.getAll(req.params.restaurantId, { available: 'true' });
  res.json({ success: true, data: items });
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.get(req.params.restaurantId);
  if (!settings) {
    return res.json({ success: true, data: null });
  }
  // Return only public-safe fields
  const { notificationEmail, kitchenPin, ...publicSettings } = settings;
  res.json({ success: true, data: publicSettings });
});

export const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { items, ...rest } = req.body;

  // Server-side price lookup — never trust client-submitted prices
  const menuItemIds = items.map(i => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId },
    select: { id: true, price: true, name: true, available: true },
  });

  const menuItemMap = new Map(menuItems.map(m => [m.id, m]));
  const verifiedItems = [];

  for (const item of items) {
    const dbItem = menuItemMap.get(item.menuItemId);
    if (!dbItem) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Menu item not found: ${item.name}` },
      });
    }
    if (!dbItem.available) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Item unavailable: ${dbItem.name}` },
      });
    }
    verifiedItems.push({
      menuItemId: item.menuItemId,
      name: dbItem.name,
      quantity: item.quantity,
      price: dbItem.price,
    });
  }

  const total = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await ordersService.create(restaurantId, {
    ...rest,
    items: verifiedItems,
    total: Math.round(total * 100) / 100,
    status: 'pending',
  });
  emitOrderCreated(restaurantId, order);
  res.status(201).json({ success: true, data: order });
});

export const checkOrderStatus = asyncHandler(async (req, res) => {
  const { customerName, customerMobile } = req.query;
  if (!customerName || !customerMobile) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'customerName and customerMobile are required' },
    });
  }
  const orders = await ordersService.getByCustomer(req.params.restaurantId, customerName, customerMobile);
  res.json({ success: true, data: orders });
});

export const submitReview = asyncHandler(async (req, res) => {
  const review = await reviewsService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: review });
});

export const getMenuItemReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewsService.getByMenuItem(req.params.restaurantId, req.params.menuItemId);
  res.json({ success: true, data: reviews });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await menuItemsService.getCategories(req.params.restaurantId);
  res.json({ success: true, data: categories });
});

export const verifyKitchenPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const { restaurantId } = req.params;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'PIN must be exactly 4 digits' },
    });
  }

  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
  });

  if (!settings || !settings.kitchenPin) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'Invalid kitchen PIN' },
    });
  }

  if (pin !== settings.kitchenPin) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'Invalid kitchen PIN' },
    });
  }

  // Return active orders on successful verification
  const orders = await ordersService.getAll(restaurantId, {});
  const activeOrders = orders.filter(o =>
    !['completed', 'cancelled', 'rejected'].includes(o.status)
  );

  res.json({ success: true, data: { orders: activeOrders } });
});
