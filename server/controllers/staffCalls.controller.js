import { asyncHandler } from '../utils/asyncHandler.js';
import * as staffCallsService from '../services/staffCalls.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const calls = await staffCallsService.getAll(req.params.restaurantId);
  res.json({ success: true, data: calls });
});

export const markRead = asyncHandler(async (req, res) => {
  const call = await staffCallsService.markRead(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: call });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await staffCallsService.markAllRead(req.params.restaurantId);
  res.json({ success: true, message: 'All notifications marked read' });
});

export const clearAll = asyncHandler(async (req, res) => {
  await staffCallsService.clearAll(req.params.restaurantId);
  res.json({ success: true, message: 'Notifications cleared' });
});
