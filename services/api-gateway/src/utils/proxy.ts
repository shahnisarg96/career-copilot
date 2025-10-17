import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from './logger.js';

/**
 * Helper function to create a proxy middleware with common configurations.
 * @param target - The target service URL.
 * @param pathRewrite - Path rewrite rules.
 * @returns Configured proxy middleware.
 */
export const createServiceProxy = (target: string, pathRewrite: Record<string, string>) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq: any, req: any, _res: any) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err: any, _req: any, res: any) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(502).json({ 
        error: 'Service unavailable',
        message: err.message 
      });
    },
  }) as any;
};
