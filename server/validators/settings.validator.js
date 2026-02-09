import { z } from 'zod';

export const upsertSettingsSchema = z.object({
  restaurantName: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).default('INR'),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional().nullable(),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color').optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color').optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  serviceCharge: z.number().min(0).max(1).optional().nullable(),
  allowOnlineOrders: z.boolean().optional(),
  allowTableReservations: z.boolean().optional(),
  notificationEmail: z.string().email().max(255).optional().nullable().or(z.literal('')),
  discountText: z.string().max(200).optional().nullable(),
  kitchenPin: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').optional().nullable(),
});
