import { asyncHandler } from '../utils/asyncHandler.js';
import * as subscriptionService from '../services/subscription.service.js';

const actor = (req) => req.user?.email || null;

export const listAll = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await subscriptionService.listAll() });
});

export const update = asyncHandler(async (req, res) => {
  const { priceRupees, reason, ...rest } = req.body;
  const changes = { ...rest };
  if (priceRupees !== undefined) changes.pricePaise = subscriptionService.rupeesToPaise(priceRupees);
  const data = await subscriptionService.update(req.params.restaurantId, changes, { reason, actorEmail: actor(req) });
  res.json({ success: true, data });
});

export const restartTrial = asyncHandler(async (req, res) => {
  const data = await subscriptionService.restartTrial(req.params.restaurantId, {
    days: req.body.days, reason: req.body.reason, actorEmail: actor(req),
  });
  res.json({ success: true, data });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const { amountRupees, ...rest } = req.body;
  const data = await subscriptionService.recordPayment(
    req.params.restaurantId,
    { ...rest, amountPaise: subscriptionService.rupeesToPaise(amountRupees) },
    { actorEmail: actor(req) },
  );
  res.status(201).json({ success: true, data });
});

export const events = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await subscriptionService.getEvents(req.params.restaurantId) });
});

export const setFreeSlots = asyncHandler(async (req, res) => {
  const cap = await subscriptionService.setFreeSlotCap(req.body.slots, actor(req));
  res.json({ success: true, data: await subscriptionService.getFreeSlotUsage() });
});

/** Restaurant-facing: a restaurant may read its own plan, never change it. */
export const mine = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.getForRestaurant(req.params.restaurantId);
  if (!sub) return res.json({ success: true, data: null });
  const { notes, ...safe } = sub;
  res.json({ success: true, data: { ...safe, priceRupees: subscriptionService.paiseToRupees(sub.pricePaise) } });
});
