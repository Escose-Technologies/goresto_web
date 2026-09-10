import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationsService from '../services/notifications.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const data = await notificationsService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data });
});

export const markRead = asyncHandler(async (req, res) => {
  const data = await notificationsService.markRead(req.params.restaurantId, req.params.id);
  res.json({ success: true, data });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const data = await notificationsService.markAllRead(req.params.restaurantId);
  res.json({ success: true, data });
});

export const clearAll = asyncHandler(async (req, res) => {
  const data = await notificationsService.clearAll(req.params.restaurantId);
  res.json({ success: true, data });
});
