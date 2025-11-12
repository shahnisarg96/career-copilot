import { Router } from 'express';
import { generatePortfolio, savePortfolio } from '../controllers/ai.controller.js';

const router = Router();

router.post('/generate-portfolio', generatePortfolio);
router.post('/save-portfolio', savePortfolio);

export default router;
