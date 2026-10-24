import { logger } from '@jobscale/create-logger';
import { service } from './service.js';

export class Controller {
  hostname(req, res) {
    return service.hostname()
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.cause?.message ?? e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.cause?.message ?? e.message });
    });
  }

  find(req, res) {
    const { code } = req.body;
    return service.find({ code })
    .then(result => res.json(result))
    .catch(e => {
      logger.info({ message: e.cause?.message ?? e.message });
      if (!e.status) e.status = 500;
      res.status(e.status).json({ message: e.cause?.message ?? e.message });
    });
  }
}

export const controller = new Controller();
export default { Controller, controller };
