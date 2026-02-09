import { asyncHandler } from '../utils/asyncHandler.js';
import * as tablesService from '../services/tables.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const tables = await tablesService.getAll(req.params.restaurantId);
  res.json({ success: true, data: tables });
});

export const getById = asyncHandler(async (req, res) => {
  const table = await tablesService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: table });
});

export const create = asyncHandler(async (req, res) => {
  const table = await tablesService.create(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: table });
});

export const update = asyncHandler(async (req, res) => {
  const table = await tablesService.update(req.params.restaurantId, req.params.id, req.body);
  res.json({ success: true, data: table });
});

export const remove = asyncHandler(async (req, res) => {
  await tablesService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Table deleted successfully' } });
});
