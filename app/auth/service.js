import fs from 'fs';
import crypto from 'crypto';
import { authModel } from './model.js';

const jwtSecret = 'node-express-ejs';
const hashKey = 'AS2P8AcBedZ';
const db = {
  users: 'db/users.json',
};
const alg = 'sha512';

export class AuthService {
  login(rest) {
    const { login, password } = rest;
    const ts = new Date().toLocaleString();
    const { users } = JSON.parse(fs.readFileSync(db.users).toString());
    this.refactorUsers(users);
    const plain = `${login}/${password}`;
    const hash = crypto.createHash(alg).update(plain).digest('hex');
    const kickoff = () => {
      if (users.length > 2) return undefined;
      const user = { login, hash };
      users.push(user);
      return user;
    };
    const user = users.find(item => item.login === login && item.hash === hash) || kickoff();
    if (!user) {
      const e = new Error('Unauthorized');
      e.status = 401;
      throw e;
    }
    user.lastLogin = ts;
    fs.writeFileSync(db.users, JSON.stringify({ users }, null, 2));
    const token = authModel.sign({ login, ts }, jwtSecret);
    return Promise.resolve(token);
  }

  refactorUsers(users) {
    users.forEach(user => {
      if (user.hash) return;
      const plain = `${user.login}/${user.password || hashKey}`;
      user.hash = crypto.createHash(alg).update(plain).digest('hex');
      delete user.password;
    });
  }

  async verify(token) {
    if (!token) throw new Error('Bad Request');
    if (!authModel.verify(token, jwtSecret)) throw new Error('Unauthorized');
  }
}

export const authService = new AuthService();
export default {
  AuthService,
  authService,
};
