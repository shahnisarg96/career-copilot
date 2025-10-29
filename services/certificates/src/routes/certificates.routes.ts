import express from 'express';
import {
	getCertificates,
	getCertificateById,
	createCertificate,
	updateCertificate,
	deleteCertificate,
	replaceCertificatesForUser,
} from '../controllers/certificates.controller.js';

const router = express.Router();

router.get('/', getCertificates);
router.get('/:id', getCertificateById);
router.post('/', createCertificate);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/certificates -> PUT /certificates)
router.put('/', replaceCertificatesForUser);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

export default router;
