import { asyncHandler } from '../utils/asyncHandler.js';
import * as registrationService from '../services/registration.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registrationService.register(req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Registration successful. Your restaurant is pending approval.',
  });
});

export const getPending = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getPendingRegistrations();
  res.json({ success: true, data: registrations });
});

export const approve = asyncHandler(async (req, res) => {
  const restaurant = await registrationService.approveRegistration(req.params.id);
  res.json({ success: true, data: restaurant });
});

export const reject = asyncHandler(async (req, res) => {
  const restaurant = await registrationService.rejectRegistration(req.params.id);
  res.json({ success: true, data: restaurant });
});
