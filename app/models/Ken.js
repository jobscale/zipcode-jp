import Sequelize from 'sequelize';
import { database } from '../../config/database.js';

const tableName = 'ken';

export const Ken = database.define(tableName, {
  jis_code: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  postal_code5: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  postal_code7: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  pref_kana: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  city_kana: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  address_kana: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  pref: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  city: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  address: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag1: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag2: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag3: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag4: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag5: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  flag6: {
    allowNull: false,
    type: Sequelize.STRING,
  },
}, { tableName });
