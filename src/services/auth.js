import * as fs from 'node:fs';
import path from 'node:path';

import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Handlebars from 'handlebars';

import { UserCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const RESET_PASSWORD_TEMPLATE = fs.readFileSync(
  path.resolve('src/templates/reset-password.hbs'),
  { encoding: 'utf-8' },
);

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

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

  const session = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...session,
  });
};

export const logoutUser = async (sessionId, refreshToken) => {
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
};

export const refreshUserSession = async (sessionId, refreshToken) => {
  const currentSession = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!currentSession) {
    throw new createHttpError(401, 'Session not found');
  }

  if (currentSession.refreshTokenValidUntil < new Date()) {
    throw new createHttpError(401, 'Refresh token is expired');
  }

  await SessionsCollection.deleteOne({
    _id: currentSession._id,
    refreshToken: currentSession.refreshToken,
  });

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: currentSession.userId,
    ...newSession,
  });
};

export const requestPasswordReset = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw new createHttpError.NotFound('User not found');
  }

  const resetToken = jwt.sign(
    { sub: user._id, name: user.name },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  const template = Handlebars.compile(RESET_PASSWORD_TEMPLATE);
  const link = `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`;
  await sendEmail(email, 'Reset your password', template({ link }));
};
export const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));
    const user = await UserCollection.findById(decoded.sub);
    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    await UserCollection.findByIdAndUpdate(user._id, {
      password: encryptedPassword,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new createHttpError.Unauthorized('Token is expired or invalid.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new createHttpError.Unauthorized('Token is expired or invalid.');
    }
  }
};
