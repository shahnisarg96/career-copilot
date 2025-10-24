import express from 'express';
import {
	getExperiences,
	getExperienceById,
	createExperience,
	updateExperience,
	deleteExperience,
	replaceExperiencesForUser,
} from '../controllers/experience.controller.js';

const router = express.Router();

router.get('/', getExperiences);
router.get('/:id', getExperienceById);
router.post('/', createExperience);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/experience -> PUT /experience)
router.put('/', replaceExperiencesForUser);
router.put('/:id', updateExperience);
router.delete('/:id', deleteExperience);

export default router;
