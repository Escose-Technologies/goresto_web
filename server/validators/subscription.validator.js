import { z } from 'zod';

// A reason is required on every mutation, not optional by convention:
// "why is this restaurant paying Rs 400?" must be answerable a year later.
const reason = z.string().min(3, 'A reason is required').max(500).trim();

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['free_trial', 'standard', 'custom']).optional(),
  status: z.enum(['trialing', 'active', 'past_due', 'suspended', 'cancelled']).optional(),
  // Accepted in rupees from the UI; converted to paise in the controller.
  priceRupees: z.coerce.number().min(0).max(1000000).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  trialEndsAt: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  reason,
});

export const restartTrialSchema = z.object({
  days: z.coerce.number().int().min(1).max(3650).default(365),
  reason,
});

export const recordPaymentSchema = z.object({
  amountRupees: z.coerce.number().min(0).max(1000000),
  method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']).default('upi'),
  reference: z.string().max(200).optional().nullable(),
  periodStart: z.string().optional().nullable(),
  periodEnd: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const freeSlotsSchema = z.object({
  slots: z.coerce.number().int().min(0).max(100000),
});
