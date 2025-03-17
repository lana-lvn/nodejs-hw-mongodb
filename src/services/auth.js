import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

import { UserCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) {
    throw new createHttpError(409, 'Email in use');
  }
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};
export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (!user) {
    throw new createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw new createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};
