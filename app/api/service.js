import os from 'os';
import { Op } from 'sequelize';
import { Ken } from '../models/Ken.js';

export class Service {
  async hostname() {
    return {
      hostname: os.hostname(),
      ip: await fetch('https://inet-ip.info/ip').then(res => res.text()).catch(e => e.message),
    };
  }

  async find(rest) {
    const { code } = rest;
    if (code.length < 3) return [];
    const options = {
      raw: true,
      attributes: [
        ['postal_code7', 'code'], 'pref', 'city', 'address',
      ],
      where: {
        postal_code7: {
          [Op.like]: `${code}%`,
          [Op.notLike]: '%0000',
        },
      },
      order: [
        ['code', 'asc'],
      ],
      limit: 100,
    };
    return Ken.findAll(options);
  }
}

export const service = new Service();
export default { Service, service };
