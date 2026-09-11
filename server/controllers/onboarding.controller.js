import { asyncHandler } from '../utils/asyncHandler.js';
import * as onboardingService from '../services/onboarding.service.js';

/** A restaurant's own setup progress. */
export const mine = asyncHandler(async (req, res) => {
  const data = await onboardingService.getChecklist(req.params.id);
  res.json({ success: true, data });
});

/** Every restaurant's progress — Goresto team only. */
export const all = asyncHandler(async (req, res) => {
  const data = await onboardingService.getChecklistForAll();
  res.json({ success: true, data });
});
