import { logger } from '@dissertation/common';

/**
 * Centralized error handling middleware.
 * Logs error details and responds with appropriate status codes.
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error(`ERROR: ${req.method} ${req.originalUrl} - ${err.message}`);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      traceId: req.headers['x-trace-id'] || 'N/A',
    },
  });
};
