import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { restaurantScope } from '../middleware/restaurantScope.js';
import { validate } from '../middleware/validate.js';
import { restaurantIdParamSchema } from '../validators/common.validator.js';
import * as photosController from '../controllers/restaurantPhotos.controller.js';

const router = Router({ mergeParams: true });

// Object-storage URLs only. Base64 data: URIs are rejected — every photo is
// sent to every customer opening the public menu, so they must stay cheap.
const photoUrlSchema = z
  .string()
  .trim()
  .url('Photo must be an uploaded image URL')
  .max(2048)
  .refine((u) => u.startsWith('https://'), 'Photo URL must be https');

const createSchema = z.object({
  url: photoUrlSchema,
  caption: z.string().max(120).trim().optional().nullable(),
});

const updateSchema = z.object({
  caption: z.string().max(120).trim().optional().nullable(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).max(50),
});

router.use(authenticate, authorize('restaurant_admin', 'superadmin'), validate(restaurantIdParamSchema, 'params'), restaurantScope);

router.get('/', photosController.getAll);
router.post('/', validate(createSchema), photosController.create);
router.put('/reorder', validate(reorderSchema), photosController.reorder);
router.patch('/:id', validate(updateSchema), photosController.update);
router.delete('/:id', photosController.remove);

export default router;
