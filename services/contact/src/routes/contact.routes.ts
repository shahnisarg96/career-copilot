import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  replaceContactsForUser,
} from '../controllers/contact.controller.js';

const router = express.Router();

router.get('/', getContacts);
// Admin routes (same handlers)
router.get('/admin', getContacts);
router.get('/admin/:id', getContactById);
router.post('/admin', createContact);
// Bulk/admin-friendly replace (gateway proxies PUT /admin/contact -> PUT /contact/admin)
router.put('/admin', replaceContactsForUser);
router.put('/admin/:id', updateContact);
router.delete('/admin/:id', deleteContact);

router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
