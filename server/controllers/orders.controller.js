import { asyncHandler } from '../utils/asyncHandler.js';
import * as ordersService from '../services/orders.service.js';
import { emitOrderCreated, emitOrderUpdated } from '../utils/socketEmitter.js';

export const getAll = asyncHandler(async (req, res) => {
  const orders = await ordersService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data: orders });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await ordersService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: order });
});

export const create = asyncHandler(async (req, res) => {
  const order = await ordersService.create(req.params.restaurantId, req.body);
  emitOrderCreated(req.params.restaurantId, order);
  res.status(201).json({ success: true, data: order });
});

export const update = asyncHandler(async (req, res) => {
  const order = await ordersService.update(req.params.restaurantId, req.params.id, req.body);
  emitOrderUpdated(req.params.restaurantId, order);
  res.json({ success: true, data: order });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await ordersService.updateStatus(req.params.restaurantId, req.params.id, req.body.status);
  emitOrderUpdated(req.params.restaurantId, order);
  res.json({ success: true, data: order });
});

export const remove = asyncHandler(async (req, res) => {
  await ordersService.remove(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: { message: 'Order deleted successfully' } });
});
