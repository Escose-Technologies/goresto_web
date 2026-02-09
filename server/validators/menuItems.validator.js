import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  price: z.number().positive('Price must be positive').max(99999.99),
  description: z.string().max(1000).optional().nullable().default(''),
  category: z.string().min(1, 'Category is required').max(100).trim(),
  image: z.string().optional().nullable().default(''),
  available: z.boolean().default(true),
  dietary: z.object({
    type: z.enum(['veg', 'non-veg', 'egg']).default('veg'),
    spiceLevel: z.number().int().min(0).max(3).default(0),
    allergens: z.array(z.string().max(50)).max(20).default([]),
    labels: z.array(z.string().max(50)).max(20).default([]),
  }).optional().default({}),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
