import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { generalLimiter } from './config/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(corsOptions);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', generalLimiter);

// Trust proxy (for Vercel)
app.set('trust proxy', 1);

// API routes
app.use('/api', routes);

// 404 handler for API routes
app.use('/api', notFound);

// Global error handler
app.use(errorHandler);

export default app;
