import Joi from 'joi';

export class Validation {
  find(req, res) {
    const { body } = req;
    const { error } = Joi.object({
      code: Joi.string().required().min(3).max(7),
    }).validate(body);
    if (error) {
      res.status(200).json([]);
    }
  }
}

export const validation = new Validation();
export default { Validation, validation };
