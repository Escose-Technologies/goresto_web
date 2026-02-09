import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewsService from '../services/reviews.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const reviews = await reviewsService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data: reviews });
});

export const remove = asyncHandler(async (req, res) => {
  await reviewsService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Review deleted successfully' } });
});
