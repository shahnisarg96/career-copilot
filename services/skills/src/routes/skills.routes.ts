import express from 'express';
import {
	getSkills,
	getSkillById,
	createSkill,
	updateSkill,
	deleteSkill,
	replaceSkillsForUser,
} from '../controllers/skills.controller.js';

const router = express.Router();

router.get('/', getSkills);
router.get('/:id', getSkillById);
router.post('/', createSkill);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/skills -> PUT /skills)
router.put('/', replaceSkillsForUser);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
