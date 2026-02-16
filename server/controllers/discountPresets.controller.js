import { asyncHandler } from '../utils/asyncHandler.js';
import * as discountPresetsService from '../services/discountPresets.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const presets = await discountPresetsService.getAll(req.params.restaurantId);
  res.json({ success: true, data: presets });
});

export const getActive = asyncHandler(async (req, res) => {
  const presets = await discountPresetsService.getActive(req.params.restaurantId);
  res.json({ success: true, data: presets });
});

export const getById = asyncHandler(async (req, res) => {
  const preset = await discountPresetsService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: preset });
});

export const create = asyncHandler(async (req, res) => {
  const preset = await discountPresetsService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: preset });
});

export const update = asyncHandler(async (req, res) => {
  const preset = await discountPresetsService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: preset });
});

export const remove = asyncHandler(async (req, res) => {
  await discountPresetsService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Discount preset deleted successfully' } });
});
