import { asyncHandler } from '../utils/asyncHandler.js';
import * as settingsService from '../services/settings.service.js';

export const get = asyncHandler(async (req, res) => {
  const settings = await settingsService.get(req.params.restaurantId);
  res.json({ success: true, data: settings });
});

export const upsert = asyncHandler(async (req, res) => {
  const settings = await settingsService.upsert(req.params.restaurantId, req.body);
  res.json({ success: true, data: settings });
});
