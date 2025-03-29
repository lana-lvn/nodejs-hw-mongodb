import express from 'express';

import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  patchContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

import { contactsSchema, updateContactSchema } from '../validation/contacts.js';

const router = express.Router();
const jsonParser = express.json();
router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));
router.post(
  '/',
  upload.single('photo'),
  jsonParser,
  validateBody(contactsSchema),
  ctrlWrapper(createContactController),
);
router.patch(
  '/:contactId',
  upload.single('photo'),
  jsonParser,
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));
export default router;
