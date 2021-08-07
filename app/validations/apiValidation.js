const Joi = require('joi');

class ApiValidation {
  slack(req, res, next) {
    const { body } = req;
    const { error } = Joi.object({
      text: Joi.string().min(1).max(2 ** 16 - 1),
    }).validate(body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next();
  }
}

module.exports = {
  ApiValidation,
  apiValidation: new ApiValidation(),
};
