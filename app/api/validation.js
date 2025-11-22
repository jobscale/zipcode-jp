import Joi from 'joi';

export class ApiValidation {
  find(req, res, next) {
    const { body } = req;
    const { error } = Joi.object({
      code: Joi.string().required().min(3).max(7),
    }).validate(body);
    if (error) {
      res.status(200).json([]);
      return;
    }
    next();
  }
}

export const apiValidation = new ApiValidation();
export default {
  ApiValidation,
  apiValidation,
};
