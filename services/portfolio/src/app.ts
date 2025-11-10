import express from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolio.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import requestResponseLogger from './middlewares/requestResponseLogger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestResponseLogger);

app.use('/', portfolioRoutes);

app.use(errorHandler);

export default app;
