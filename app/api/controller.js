import { logger } from '@jobscale/logger';
import { apiService } from './service.js';

export class ApiController {
  hostname(req, res) {
    apiService.hostname()
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.message });
    });
  }

  find(req, res) {
    const { code } = req.body;
    apiService.find({ code })
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.message });
    });
  }
}

export const apiController = new ApiController();

export default {
  ApiController,
  apiController,
};
