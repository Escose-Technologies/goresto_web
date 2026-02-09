import { asyncHandler } from '../utils/asyncHandler.js';
import * as restaurantsService from '../services/restaurants.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const restaurants = await restaurantsService.getAll();
  res.json({ success: true, data: restaurants });
});

export const getMine = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.getByUser(req.user);
  res.json({ success: true, data: restaurant });
});

export const getById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.getById(req.params.id);
  res.json({ success: true, data: restaurant });
});

export const create = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.create(req.body);
  res.status(201).json({ success: true, data: restaurant });
});

export const update = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.update(req.params.id, req.body);
  res.json({ success: true, data: restaurant });
});

export const remove = asyncHandler(async (req, res) => {
  await restaurantsService.remove(req.params.id);
  res.json({ success: true, data: { message: 'Restaurant deleted successfully' } });
});
