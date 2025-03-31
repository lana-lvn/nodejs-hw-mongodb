import * as fs from 'node:fs/promises';
import path from 'node:path';

import createHttpError from 'http-errors';

import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  patchContact,
} from '../services/contacts.js';

import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId: req.user.id,
  });
  res.status(200).send({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, _next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw new createHttpError.Forbidden();
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const photo = req.file;
  let photoUrl;
  if (photo) {
    if (getEnvVar('UPLOAD_TO_CLOUDINARY') === 'true') {
      const result = await uploadToCloudinary(photo.path);
      photoUrl = result.secure_url;
    } else {
      await fs.rename(
        photo.path,
        path.resolve('src', 'uploads', photo.filename),
      );
      photoUrl = `http://localhost:3000/uploads/${photo.filename}`;
    }
  }

  const contact = await createContact({
    ...req.body,
    userId: req.user.id,
    photo: photoUrl,
  });
  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const userId = req.user.id;
  const photo = req.file;
  let photoUrl;
  if (photo) {
    if (getEnvVar('UPLOAD_TO_CLOUDINARY') === 'true') {
      const result = await uploadToCloudinary(photo.path);
      photoUrl = result.secure_url;
    } else {
      await fs.rename(
        photo.path,
        path.resolve('src', 'uploads', photo.filename),
      );
      photoUrl = `http://localhost:3000/uploads/${photo.filename}`;
    }
  }

  const { contactId } = req.params;
  const result = await patchContact(contactId, userId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!result) {
    throw new createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const userId = req.user.id;
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, userId);

  if (!contact) {
    throw new createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
