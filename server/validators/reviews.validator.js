import { z } from 'zod';

export const createReviewSchema = z.object({
  menuItemId: z.string().min(1).optional().nullable(),
  customerName: z.string().min(1, 'Name is required').max(200).trim(),
  customerMobile: z.string().max(20).optional().nullable(),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  comment: z.string().max(1000).trim().optional().default(''),
});
