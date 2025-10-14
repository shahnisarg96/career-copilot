import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './routes/index.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { logger } from '@dissertation/common';
import { config } from './config/index.js';
import { randomBytes } from 'crypto';
import { requestResponseLogger } from './middlewares/requestResponseLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requireJwt } from './middlewares/auth.js';

const app = express();

// Trust reverse proxies (e.g., nginx) so req.ip uses X-Forwarded-For.
app.set('trust proxy', true);

// Middleware: Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-trace-id'],
}));

// Middleware: Add security headers
app.use(helmet());

// Middleware: Parse JSON payloads
app.use(express.json());

// Middleware: Rate limiting (skip for health checks)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || req.path === '/health') {
    return next();
  }
  rateLimiter(req, res, next);
});

// Middleware: Custom timeout handler
app.use((_req, res, next) => {
  const timeoutDuration = Number(config.requestTimeout);
  res.setTimeout(timeoutDuration, () => {
    res.status(503).json({ 
      error: 'Request timed out',
      message: 'Please try again later.' 
    });
  });
  next();
});

// Middleware: Custom header for traceability
app.use((req, res, next) => {
  const traceId = randomBytes(16).toString('hex');
  req.headers['x-trace-id'] = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
});

// Middleware: Request and response logging
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  requestResponseLogger(req, res, next);
});

// Auth: protect admin routes and most /auth routes
app.use('/admin', requireJwt);
app.use('/auth', (req, res, next) => {
  if (req.path === '/login' || req.path === '/signup') return next();
  return requireJwt(req, res, next);
});

// Register all routes
setupRoutes(app);

// Middleware: 404 Not Found handler
app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: 'Error',
    message: 'Route not found.',
    data: null,
  });
});

// Middleware: Centralized error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing server...');
  process.exit(0);
});

export default app;
