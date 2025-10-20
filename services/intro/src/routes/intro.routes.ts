import express from 'express';
import {
	getIntros,
	getIntroById,
	createIntro,
	updateIntro,
	deleteIntro,
	upsertIntroForUser,
} from '../controllers/intro.controller.js';

const router = express.Router();

router.get('/', getIntros);
router.get('/:id', getIntroById);
router.post('/', createIntro);
// Bulk/admin-friendly upsert (gateway proxies PUT /admin/intro -> PUT /intro)
router.put('/', upsertIntroForUser);
router.put('/:id', updateIntro);
router.delete('/:id', deleteIntro);

export default router;
