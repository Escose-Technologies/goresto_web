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
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
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

  const ext = req.file.originalname.split('.').pop() || 'jpg';
  const fileName = `menu-items/${randomUUID()}.${ext}`;
  const url = await uploadImage(req.file.buffer, fileName, req.file.mimetype);

  res.json({ success: true, data: { url } });
}));

export default router;
