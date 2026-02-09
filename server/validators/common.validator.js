import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
});

export const restaurantAndIdParamSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  id: z.string().min(1, 'ID is required'),
});
