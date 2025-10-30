import express from 'express';
import cors from 'cors';
import educationRoutes from './routes/education.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import requestResponseLogger from './middlewares/requestResponseLogger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestResponseLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/education', educationRoutes);

app.use(errorHandler);

export default app;
