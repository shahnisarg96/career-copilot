import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '@dissertation/common';

const limiter = new RateLimiterMemory({ 
  points: config.points, 
  duration: config.duration 
});

/**
 * Rate Limiter Middleware
 * Limits requests to configured points per duration per IP
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  limiter
    .consume(req.ip || 'unknown-ip')
    .then(() => {
      next();
    })
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.' 
      });
    });
};
