const { Router } = require('express');
const { authController } = require('./controller');
const { authValidation } = require('./validation');

const router = Router();

class AuthRoute {
  constructor() {
    router.get(
      '/auth',
      (...args) => authController.index(...args),
    );
    router.post(
      '/auth/login',
      (...args) => authValidation.login(...args),
      (...args) => authController.login(...args),
    );
    router.use(
      '',
      (...args) => authController.verify(...args),
    );
    router.post(
      '/auth/logout',
      (...args) => authController.logout(...args),
    );
    this.router = router;
  }
}

module.exports = {
  AuthRoute,
  authRoute: new AuthRoute(),
};
