import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255).trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['superadmin', 'restaurant_admin']),
  restaurantId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255).trim().toLowerCase().optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum(['superadmin', 'restaurant_admin']).optional(),
  restaurantId: z.string().optional().nullable(),
});
