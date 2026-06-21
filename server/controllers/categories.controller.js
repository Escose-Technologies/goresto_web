import { asyncHandler } from '../utils/asyncHandler.js';
import * as categoriesService from '../services/categories.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getAll(req.params.restaurantId);
  res.json({ success: true, data: categories });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoriesService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: category });
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoriesService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: category });
});

export const remove = asyncHandler(async (req, res) => {
  await categoriesService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

export const reorder = asyncHandler(async (req, res) => {
  await categoriesService.reorder(req.params.restaurantId, req.body.orderedIds);
  res.json({ success: true, message: 'Categories reordered' });
});
