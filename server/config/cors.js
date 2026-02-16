import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// Support additional origins via env var (comma-separated)
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  process.env.ADDITIONAL_CORS_ORIGINS.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed) allowedOrigins.push(trimmed);
  });
}

export const corsOptions = cors({
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});
