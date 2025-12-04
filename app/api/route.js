import { Router } from '../router.js';
import { controller } from './controller.js';
import { validation } from './validation.js';

const router = new Router();
router.add('POST', '/hostname', controller.hostname);
router.add('POST', '/find', async (req, res) => {
  await validation.find(req, res, controller.find);
});

export const route = { router };
export default {
  route: { router },
};
