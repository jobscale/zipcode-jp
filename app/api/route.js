const { Router } = require('express');
const { apiController } = require('./controller');
const { apiValidation } = require('./validation');

const router = Router();

class ApiRoute {
  constructor() {
    router.post(
      '/hostname',
      (...args) => apiController.hostname(...args),
    );
    router.post(
      '/find',
      (...args) => apiValidation.find(...args),
      (...args) => apiController.find(...args),
    );
    this.router = router;
  }
}

module.exports = {
  ApiRoute,
  apiRoute: new ApiRoute(),
};
