import { z } from 'zod';

const itemDiscountSchema = z.object({
  menuItemId: z.string().min(1),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().min(0).max(99999.99),
  reason: z.string().max(500).optional().default(''),
});

const splitPaymentSchema = z.object({
  mode: z.enum(['cash', 'card', 'upi']),
  amount: z.number().positive('Split amount must be positive').max(999999.99),
});

export const createBillSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1, 'At least one order is required'),
  tableNumber: z.string().min(1).max(20).trim(),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']).default('dine_in'),

  // Item-level discounts (optional)
  itemDiscounts: z.array(itemDiscountSchema).max(200).default([]),

  // Bill-level discount (optional)
  billDiscountType: z.enum(['percentage', 'flat']).optional().nullable(),
  billDiscountValue: z.number().min(0).max(99999.99).default(0),
  discountPresetId: z.string().optional().nullable(),
  discountReason: z.string().max(500).optional().nullable(),

  // Payment
  paymentMode: z.enum(['cash', 'card', 'upi', 'split']).default('cash'),
  splitPayments: z.array(splitPaymentSchema).max(5).optional().default([]),
  markAsPaid: z.boolean().default(true),

  // Optional
  customerGstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional().nullable().or(z.literal('')),
  packagingCharge: z.number().min(0).max(9999.99).default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const updatePaymentSchema = z.object({
  paymentMode: z.enum(['cash', 'card', 'upi', 'split']),
  splitPayments: z.array(splitPaymentSchema).max(5).optional().default([]),
  paidAmount: z.number().min(0).max(999999.99),
});

export const cancelBillSchema = z.object({
  cancelReason: z.string().min(1, 'Cancel reason is required').max(500).trim(),
});

export const previewCalculationSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1, 'At least one order is required'),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']).default('dine_in'),
  itemDiscounts: z.array(itemDiscountSchema).max(200).default([]),
  billDiscountType: z.enum(['percentage', 'flat']).optional().nullable(),
  billDiscountValue: z.number().min(0).max(99999.99).default(0),
  packagingCharge: z.number().min(0).max(9999.99).default(0),
});

export const billsQuerySchema = z.object({
  status: z.enum(['unpaid', 'paid', 'partially_paid', 'cancelled']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  tableNumber: z.string().optional(),
  paymentMode: z.enum(['cash', 'card', 'upi', 'split']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const summaryQuerySchema = z.object({
  from: z.string().min(1, 'Start date is required'),
  to: z.string().min(1, 'End date is required'),
});

export const unbilledOrdersQuerySchema = z.object({
  tableNumber: z.string().optional(),
});
