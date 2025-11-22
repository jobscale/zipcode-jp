import { Router } from 'express';
import { authController } from './controller.js';
import { authValidation } from './validation.js';

const router = Router();

export class AuthRoute {
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

export const authRoute = new AuthRoute();
export default {
  AuthRoute,
  authRoute,
};
