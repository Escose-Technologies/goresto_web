import { asyncHandler } from '../utils/asyncHandler.js';
import * as feedbackService from '../services/feedback.service.js';

export const create = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.create({
    restaurantId: req.params.restaurantId,
    userId: req.user?.id,
    userEmail: req.user?.email,
    data: req.body,
  });
  res.status(201).json({ success: true, data: { id: feedback.id, createdAt: feedback.createdAt } });
});

export const listMine = asyncHandler(async (req, res) => {
  const data = await feedbackService.listForRestaurant(req.params.restaurantId);
  res.json({ success: true, data });
});

export const listAll = asyncHandler(async (req, res) => {
  const data = await feedbackService.listAll(req.query);
  res.json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await feedbackService.update(req.params.id, req.body);
  res.json({ success: true, data });
});
