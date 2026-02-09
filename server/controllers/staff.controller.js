import { asyncHandler } from '../utils/asyncHandler.js';
import * as staffService from '../services/staff.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const staff = await staffService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data: staff });
});

export const getById = asyncHandler(async (req, res) => {
  const member = await staffService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: member });
});

export const create = asyncHandler(async (req, res) => {
  const member = await staffService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: member });
});

export const update = asyncHandler(async (req, res) => {
  const member = await staffService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: member });
});

export const remove = asyncHandler(async (req, res) => {
  await staffService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Staff member deleted successfully' } });
});
