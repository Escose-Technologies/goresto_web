import { z } from 'zod';

export const createTableSchema = z.object({
  number: z.string().min(1, 'Table number is required').max(20).trim(),
  capacity: z.number().int().positive('Capacity must be positive').max(100),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).default('available'),
  location: z.enum(['Indoor', 'Outdoor', 'VIP', 'Bar']).default('Indoor'),
});

export const updateTableSchema = createTableSchema.partial();
