import { z } from 'zod';

// ~5MB binary becomes ~6.85MB of base64; allow some headroom for the data: prefix.
const MAX_IMAGE_CHARS = 7_500_000;

// Base64 data-URL image, size-bounded and format-restricted so the API can't be
// used to store arbitrary/oversized blobs (the client limits to 5MB; the server
// must enforce it independently).
const base64Image = z
  .string()
  .max(MAX_IMAGE_CHARS, 'Image is too large (max ~5MB)')
  .refine(
    (v) => v === '' || /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(v),
    'Must be a valid image',
  )
  .optional()
  .nullable()
  .or(z.literal(''));

// Blocks script-y URL schemes (javascript:, data:, vbscript:) that would turn a
// stored link into an XSS vector when rendered as an href on the public menu.
const safeLink = (max) =>
  z
    .string()
    .max(max)
    .refine((v) => !v || !/^\s*(javascript|data|vbscript):/i.test(v), 'Invalid URL')
    .optional()
    .nullable()
    .or(z.literal(''));

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(2000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  website: safeLink(500),
  logo: base64Image,
  coverImage: base64Image,
  cuisineTypes: z.array(z.string().max(50)).max(20).optional().default([]),
  foodType: z.enum(['pure_veg', 'egg', 'veg_egg', 'non_veg', 'both']).optional().default('both'),
  socialLinks: z.object({
    instagram: safeLink(200).default(''),
    facebook: safeLink(200).default(''),
    twitter: safeLink(200).default(''),
  }).optional().nullable(),
  openingHours: z.string().max(500).optional().nullable(),
  discount: z.any().optional().nullable(),
  adminId: z.string().optional().nullable(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();
