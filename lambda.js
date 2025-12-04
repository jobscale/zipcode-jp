import fs from 'fs';
import logger from '@jobscale/logger';
import { server as application } from './index.js';

const distribution = () => {
  const env = fs.readFileSync('/etc/os-release', 'utf-8');
  logger.info({ env });
  return env;
};

exports.handler = async event => {
  logger.info('EVENT', JSON.stringify(event, null, 2));

  distribution();

  const { body } = event;
  return application({ body }, {})
  .catch(e => logger.error(e) || {
    statusCode: 503,
    headers: { 'Content-Length': 'application/json' },
    body: JSON.stringify({ message: e.name }),
  })
  .then(response => {
    logger.info('RESPONSE', JSON.stringify(response, null, 2));
    return response;
  });
};
