import { asyncHandler } from '../utils/asyncHandler.js';
import * as usersService from '../services/users.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const users = await usersService.getAll(req.query);
  res.json({ success: true, data: users });
});

export const getById = asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.params.id);
  res.json({ success: true, data: user });
});

export const create = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);
  res.status(201).json({ success: true, data: user });
});

export const update = asyncHandler(async (req, res) => {
  const user = await usersService.update(req.params.id, req.body);
  res.json({ success: true, data: user });
});

export const remove = asyncHandler(async (req, res) => {
  await usersService.remove(req.params.id);
  res.json({ success: true, data: { message: 'User deleted successfully' } });
});
