import createHttpError from 'http-errors';

export function validateBody(schema) {
  return async (req, _res, next) => {
    try {
      const result = await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      console.log(result);
      next();
    } catch (error) {
      const errors = error.details.map((detail) => detail.message);
      next(new createHttpError.BadRequest(errors));
    }
  };
}
