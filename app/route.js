import { Router } from './router.js';
import { route as apiRoute } from './api/route.js';

const router = new Router();
router.use('', apiRoute.router);
router.use('/api', apiRoute.router);

export const route = { router };
export default { route };
