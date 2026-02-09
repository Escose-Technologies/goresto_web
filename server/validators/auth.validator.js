import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
  role: z.enum(['superadmin', 'restaurant_admin'], {
    errorMap: () => ({ message: 'Role must be superadmin or restaurant_admin' }),
  }),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
