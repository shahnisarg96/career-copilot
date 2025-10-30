import express from 'express';
import {
  getEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  replaceEducationForUser,
} from '../controllers/education.controller.js';

const router = express.Router();

router.get('/', getEducation);
// Admin routes (same handlers)
router.get('/admin', getEducation);
router.get('/admin/:id', getEducationById);
router.post('/admin', createEducation);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/education -> PUT /education/admin)
router.put('/admin', replaceEducationForUser);
router.put('/admin/:id', updateEducation);
router.delete('/admin/:id', deleteEducation);

router.get('/:id', getEducationById);
router.post('/', createEducation);
router.put('/:id', updateEducation);
router.delete('/:id', deleteEducation);

export default router;
