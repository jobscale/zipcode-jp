import { Router } from 'express';
import { apiController } from './controller.js';
import { apiValidation } from './validation.js';

const router = Router();

export class ApiRoute {
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

export const apiRoute = new ApiRoute();

export default {
  ApiRoute,
  apiRoute,
};
