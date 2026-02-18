import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(2000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  website: z.string().max(500).optional().nullable().or(z.literal('')),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  cuisineTypes: z.array(z.string().max(50)).max(20).optional().default([]),
  foodType: z.enum(['pure_veg', 'egg', 'non_veg', 'both']).optional().default('both'),
  socialLinks: z.object({
    instagram: z.string().max(200).optional().default(''),
    facebook: z.string().max(200).optional().default(''),
    twitter: z.string().max(200).optional().default(''),
  }).optional().nullable(),
  openingHours: z.string().max(500).optional().nullable(),
  discount: z.any().optional().nullable(),
  adminId: z.string().optional().nullable(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();
