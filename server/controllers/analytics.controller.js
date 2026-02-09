import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const get = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getAnalytics(req.params.restaurantId);
  res.json({ success: true, data: analytics });
});
