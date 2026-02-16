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
  allowCallStaff: z.boolean().optional(),
  notificationEmail: z.string().email().max(255).optional().nullable().or(z.literal('')),
  discountText: z.string().max(200).optional().nullable(),
  kitchenPin: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').optional().nullable(),

  // GST Configuration
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional().nullable().or(z.literal('')),
  gstScheme: z.enum(['regular', 'composition']).default('regular'),
  gstRate: z.number().refine(v => [0, 5, 12, 18, 28].includes(v), {
    message: 'GST rate must be 0, 5, 12, 18, or 28',
  }).default(5),
  fssaiNumber: z.string()
    .regex(/^[0-9]{14}$/, 'FSSAI number must be exactly 14 digits')
    .optional().nullable().or(z.literal('')),
  placeOfSupply: z.string().max(100).optional().nullable(),
  placeOfSupplyCode: z.string()
    .regex(/^[0-9]{2}$/, 'Must be a 2-digit state code')
    .optional().nullable().or(z.literal('')),

  // Bill Configuration
  billPrefix: z.string()
    .regex(/^[A-Z0-9]{1,5}$/, 'Must be 1-5 uppercase alphanumeric characters')
    .default('INV'),
  showServiceCharge: z.boolean().default(false),
  serviceChargeLabel: z.string().max(50).optional().nullable(),
  enableRoundOff: z.boolean().default(true),
  enablePackagingCharge: z.boolean().default(false),
  defaultPackagingCharge: z.number().min(0).max(500).optional().nullable(),
  billFooterText: z.string().max(500).optional().nullable(),
  showFeedbackQR: z.boolean().default(false),
  autoPrintOnBill: z.boolean().default(false),
  thermalPrinterWidth: z.enum(['eighty_mm', 'fifty_eight_mm']).default('eighty_mm'),
});
