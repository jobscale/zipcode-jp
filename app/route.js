import { Router } from 'express';
import { apiRoute } from './api/route.js';
import { authRoute } from './auth/route.js';

const router = Router();

export class Route {
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

export const route = new Route();
export default {
  Route,
  route,
};
