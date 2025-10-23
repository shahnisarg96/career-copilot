import express from 'express';
import {
  getAbouts,
  getAboutById,
  createAbout,
  updateAbout,
  deleteAbout,
  upsertAboutForUser,
} from '../controllers/about.controller.js';

const router = express.Router();

router.get('/', getAbouts);
router.get('/:id', getAboutById);
router.post('/', createAbout);
// Bulk/admin-friendly upsert (gateway proxies PUT /admin/about -> PUT /about)
router.put('/', upsertAboutForUser);
router.put('/:id', updateAbout);
router.delete('/:id', deleteAbout);

export default router;
