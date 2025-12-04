import { logger } from '@jobscale/logger';
import { service } from './service.js';

export class Controller {
  hostname(req, res) {
    return service.hostname()
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.message });
    });
  }

  find(req, res) {
    const { code } = req.body;
    return service.find({ code })
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.message });
    });
  }
}

export const controller = new Controller();
export default { Controller, controller };
