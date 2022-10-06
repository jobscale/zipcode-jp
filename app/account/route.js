const { Router } = require('express');
const { accountController } = require('./controller');
const { accountValidation } = require('./validation');

const router = Router();

class AccountRoute {
  constructor() {
    router.get(
      '/password',
      (...args) => accountController.password(...args),
    );
    router.post(
      '/password',
      (...args) => accountValidation.password(...args),
      (...args) => accountController.password(...args),
    );
    this.router = router;
  }
}

module.exports = {
  AccountRoute,
  accountRoute: new AccountRoute(),
};
