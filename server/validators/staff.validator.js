import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  email: z.string().email('Invalid email').max(255).trim().toLowerCase(),
  phone: z.string().min(1, 'Phone is required').max(50).trim(),
  role: z.string().min(1, 'Role is required').max(100).trim(),
  photo: z.string().optional().nullable().default(''),
  hireDate: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'on-leave']).default('active'),
  address: z.string().max(500).optional().default(''),
  emergencyContact: z.string().max(200).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
});

export const updateStaffSchema = createStaffSchema.partial();
