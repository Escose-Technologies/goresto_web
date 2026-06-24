import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { uploadImage } from '../services/ociStorage.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});

router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ success: false, error: { message: err.message } });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: { message: 'No image file provided' } });

  const EXT_MAP = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const ext = EXT_MAP[req.file.mimetype] || 'jpg';
  const fileName = `menu-items/${randomUUID()}.${ext}`;
  const url = await uploadImage(req.file.buffer, fileName, req.file.mimetype);

  res.json({ success: true, data: { url } });
}));

export default router;
