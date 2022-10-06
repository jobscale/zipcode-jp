const os = require('os');
const { Op } = require('sequelize');
const Ken = require('../models/Ken');

class ApiService {
  async hostname() {
    return {
      hostname: os.hostname(),
      ip: await fetch('https://inet-ip.info/ip').then(res => res.text()).catch(e => e.message),
    };
  }

  async find(rest) {
    const { code } = rest;
    if (code.length < 4) return [];
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

module.exports = {
  ApiService,
  apiService: new ApiService(),
};
