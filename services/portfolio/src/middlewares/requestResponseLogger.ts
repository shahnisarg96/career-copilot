import { Request, Response, NextFunction } from 'express';
import { logger } from '@dissertation/common';

const requestResponseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      type: 'response',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export default requestResponseLogger;
