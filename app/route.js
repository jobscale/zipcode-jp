const { Router } = require('express');
const { apiRoute } = require('./api/route');
const { authRoute } = require('./auth/route');

const router = Router();

class Route {
  constructor() {
    router.use(
      '/api',
      (...args) => apiRoute.router(...args),
    );
    router.use(
      '',
      (...args) => authRoute.router(...args),
    );
    this.router = router;
  }
}

module.exports = {
  Route,
  route: new Route(),
};
