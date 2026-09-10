import { z } from 'zod';

export const createFeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating is required').max(5),
  category: z.enum(['bug', 'feature_request', 'general']).default('general'),
  title: z.string().min(3, 'Title is too short').max(200).trim(),
  details: z.string().min(5, 'Please add a little more detail').max(5000).trim(),
  consentGiven: z.boolean().default(false),
  // Free-form on purpose: the shape evolves with the client, and the server
  // should not reject a report because a new field appeared.
  diagnostics: z.any().optional().nullable(),
});

export const feedbackQuerySchema = z.object({
  status: z.enum(['new', 'triaged', 'in_progress', 'resolved', 'wont_fix']).optional(),
  category: z.enum(['bug', 'feature_request', 'general']).optional(),
});

export const updateFeedbackSchema = z.object({
  status: z.enum(['new', 'triaged', 'in_progress', 'resolved', 'wont_fix']).optional(),
  adminNotes: z.string().max(5000).optional().nullable(),
});
