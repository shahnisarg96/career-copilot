import express from 'express';
import {
  getPortfolioStatus,
  publishPortfolio,
  getPortfolioBySlug,
} from '../controllers/portfolio.controller.js';

const router = express.Router();

// Public routes
router.get('/portfolio/status/:userId', getPortfolioStatus);
router.get('/portfolio/slug/:slug', getPortfolioBySlug);
router.post('/portfolio/publish', publishPortfolio);

// Admin routes (same handlers)
router.get('/admin/portfolio/status/:userId', getPortfolioStatus);
router.post('/admin/portfolio/publish', publishPortfolio);

export default router;
