import { asyncHandler } from '../utils/asyncHandler.js';
import * as healthService from '../services/platformHealth.service.js';

/** Goresto-team view. Read-only; nothing here writes or is visible to a restaurant. */
export const overview = asyncHandler(async (req, res) => {
  const [restaurants, funnel, totals] = await Promise.all([
    healthService.getRestaurantHealth(),
    healthService.getFunnel(),
    healthService.getTotals(),
  ]);
  res.json({ success: true, data: { restaurants, funnel, totals } });
});
