import { asyncHandler } from '../utils/asyncHandler.js';
import * as menuItemsService from '../services/menuItems.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const items = await menuItemsService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await menuItemsService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: item });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await menuItemsService.getCategories(req.params.restaurantId);
  res.json({ success: true, data: categories });
});

export const create = asyncHandler(async (req, res) => {
  const item = await menuItemsService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await menuItemsService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await menuItemsService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Menu item deleted successfully' } });
});
