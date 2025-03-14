import { isValidObjectId } from 'mongoose';

import createHttpError from 'http-errors';
export function isValidId(req, _res, next) {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    throw createHttpError.BadRequest('ID is not valid');
  }
  next();
}
