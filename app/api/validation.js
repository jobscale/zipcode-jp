import Joi from 'joi';

export class Validation {
  async find(req, res, next) {
    const { body } = req;
    const { error } = Joi.object({
      code: Joi.string().required().min(3).max(7),
    }).validate(body);
    if (error) {
      res.status(200).json([]);
      return;
    }
    await next(req, res);
  }
}

export const validation = new Validation();
export default { Validation, validation };
