const { Router } = require('express');
const { templateController } = require('./controller');

const router = Router();

class TemplateRoute {
  constructor() {
    router.post(
      '',
      (...args) => templateController.load(...args),
    );
    this.router = router;
  }
}

module.exports = {
  TemplateRoute,
  templateRoute: new TemplateRoute(),
};
