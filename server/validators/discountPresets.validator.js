import { z } from 'zod';

export const createDiscountPresetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(500).optional().nullable().default(''),
  isActive: z.boolean().default(true),

  // Discount definition
  scope: z.enum(['bill', 'item_category', 'item_specific']).default('bill'),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().positive('Discount value must be positive').max(99999.99),

  // Conditions
  minBillAmount: z.number().min(0).max(999999.99).optional().nullable(),
  applicableCategories: z.array(z.string().max(100)).max(50).default([]),
  applicableItemIds: z.array(z.string()).max(200).default([]),

  // Schedule
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional().nullable(),
  activeDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),

  // Constraints
  requiresReason: z.boolean().default(false),
  maxDiscountAmount: z.number().min(0).max(99999.99).optional().nullable(),
  autoSuggest: z.boolean().default(true),
});

export const updateDiscountPresetSchema = createDiscountPresetSchema.partial();
