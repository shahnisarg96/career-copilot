import app from './app.js';
import { config } from './config/index.js';
import { logger } from '@dissertation/common';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Portfolio service running on port ${PORT}`);
});
