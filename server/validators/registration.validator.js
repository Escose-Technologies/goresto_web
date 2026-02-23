import { z } from 'zod';

export const registerSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required').max(200).trim(),
  email: z.string().email('Invalid email format').max(255).trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  phone: z.string().min(5, 'Phone number is too short').max(50).trim(),
  restaurantName: z.string().min(1, 'Restaurant name is required').max(200).trim(),
  address: z.string().min(1, 'Address is required').max(500).trim(),
  cuisineTypes: z.array(z.string().trim()).max(20).default([]),
  foodType: z.enum(['pure_veg', 'egg', 'non_veg', 'both']).default('both'),
});
