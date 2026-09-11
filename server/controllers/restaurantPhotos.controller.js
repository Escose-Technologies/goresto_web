import { asyncHandler } from '../utils/asyncHandler.js';
import * as photosService from '../services/restaurantPhotos.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const photos = await photosService.getAll(req.params.restaurantId);
  res.json({ success: true, data: photos });
});

export const create = asyncHandler(async (req, res) => {
  const photo = await photosService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: photo });
});

export const update = asyncHandler(async (req, res) => {
  const photo = await photosService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: photo });
});

export const remove = asyncHandler(async (req, res) => {
  await photosService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, message: 'Photo removed' });
});

export const reorder = asyncHandler(async (req, res) => {
  await photosService.reorder(req.params.restaurantId, req.body.orderedIds);
  res.json({ success: true, message: 'Photos reordered' });
});
