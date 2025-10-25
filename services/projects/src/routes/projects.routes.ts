import express from 'express';
import {
	getProjects,
	getProjectById,
	createProject,
	updateProject,
	deleteProject,
	replaceProjectsForUser,
} from '../controllers/projects.controller.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/projects -> PUT /projects)
router.put('/', replaceProjectsForUser);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
