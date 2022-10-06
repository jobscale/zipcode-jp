const Joi = require('joi');

class ApiValidation {
  find(req, res, next) {
    const { body } = req;
    const { error } = Joi.object({
      code: Joi.string().required().min(4).max(7),
    }).validate(body);
    if (error) {
      res.status(200).json([]);
      return;
    }
    next();
  }
}

module.exports = {
  ApiValidation,
  apiValidation: new ApiValidation(),
};
