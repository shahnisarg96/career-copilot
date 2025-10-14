import app from './app.js';
import { config } from './config/index.js';
import { logger } from '@dissertation/common';

const port = Number(config.port);

app.listen(port, () => {
  logger.info(`🚀 API Gateway listening on port ${port}`);
  logger.info('Available routes:');
  logger.info('  /health - Health check');
  logger.info('  /auth - Authentication service');
  logger.info('  /intro - Intro service');
  logger.info('  /about - About service');
  logger.info('  /experience - Experience service');
  logger.info('  /projects - Projects service');
  logger.info('  /skills - Skills service');
  logger.info('  /certificates - Certificates service');
  logger.info('  /education - Education service');
  logger.info('  /portfolio - Portfolio service');
  logger.info('  /contact - Contact service');
  logger.info('  /ai - AI service');
});
