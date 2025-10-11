import express from 'express';
import {
  login,
  signup,
  me,
  listUsers,
} from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.post('/signup', signup);
router.post('/login', login);

// Protected
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireRole('ADMIN'), listUsers);

export default router;
