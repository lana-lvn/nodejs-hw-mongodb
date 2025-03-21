import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UserCollection } from '../db/models/user.js';

export const authenticate = async (req, _res, next) => {
  const { authorization } = req.headers;
  if (typeof authorization !== 'string') {
    return next(
      createHttpError.Unauthorized('Please provide Authorization header'),
    );
  }

  const [bearer, accessToken] = authorization.split(' ', 2);

  if (bearer !== 'Bearer' || typeof accessToken !== 'string') {
    return next(
      createHttpError.Unauthorized('Please provide Authorization header'),
    );
  }

  const session = await SessionsCollection.findOne({
    accessToken,
  });

  if (!session) {
    return next(createHttpError.Unauthorized('Session not found'));
  }

  const isAccessTokenExpired = session.accessTokenValidUntil < new Date();

  if (isAccessTokenExpired) {
    return next(createHttpError.Unauthorized('Access token expired'));
  }
  const user = await UserCollection.findById(session.userId);

  if (!user) {
    return next(createHttpError.Unauthorized('User not found'));
  }

  req.user = { id: user._id, name: user.name };

  next();
};
