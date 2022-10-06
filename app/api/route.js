const { Router } = require('express');
const { apiController } = require('./controller');
const { apiValidation } = require('./validation');

const router = Router();

class ApiRoute {
  constructor() {
    router.post(
      '/slack',
      (...args) => apiValidation.slack(...args),
      (...args) => apiController.slack(...args),
    );
    router.post(
      '/hostname',
      (...args) => apiController.hostname(...args),
    );
    this.router = router;
  }
}

module.exports = {
  ApiRoute,
  apiRoute: new ApiRoute(),
};
