import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const get = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getAnalytics(req.params.restaurantId, {
    todayStart: req.query.todayStart,
    todayEnd: req.query.todayEnd,
  });
  res.json({ success: true, data: analytics });
});
