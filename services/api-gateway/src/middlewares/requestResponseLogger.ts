import { NextFunction } from 'express';
import { logger } from '@dissertation/common';

/**
 * Middleware to log incoming HTTP requests and their responses.
 */
export function requestResponseLogger(req: any, res: any, next: NextFunction): void {
  const startTime = Date.now();

  logger.info(`REQUEST: ${req.method} ${req.originalUrl}`);

  const chunks: Buffer[] = [];
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = ((chunk: any, ...args: any[]) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return originalWrite(chunk, ...args);
  }) as typeof res.write;

  res.end = ((chunk: any, ...args: any[]) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const responseTime = Date.now() - startTime;

    logger.info(`RESPONSE: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${responseTime}ms`);

    return originalEnd(chunk, ...args);
  }) as typeof res.end;

  next();
}
