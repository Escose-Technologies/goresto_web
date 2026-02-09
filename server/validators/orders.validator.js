import { z } from 'zod';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive().max(100),
  price: z.number().nonnegative().max(99999.99),
});

export const createOrderSchema = z.object({
  tableNumber: z.string().min(1).max(20).trim(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required').max(100),
  total: z.number().nonnegative().max(999999.99),
  status: z.enum([
    'pending', 'accepted', 'rejected', 'on-hold',
    'preparing', 'prepared', 'ready', 'served',
    'completed', 'cancelled',
  ]).default('pending'),
  customerName: z.string().max(200).trim().optional().default(''),
  customerMobile: z.string().max(20).trim().optional().default(''),
  notes: z.string().max(1000).optional().default(''),
});

export const updateOrderSchema = createOrderSchema.partial();

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending', 'accepted', 'rejected', 'on-hold',
    'preparing', 'prepared', 'ready', 'served',
    'completed', 'cancelled',
  ]),
});
