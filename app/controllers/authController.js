const path = require('path');
const { authService } = require('../services/authService');

class AuthController {
  index(req, res) {
    authService.now()
    .then((now) => {
      res.render('auth/login', { title: 'Login', now });
    });
  }

  login(req, res) {
    const { login, password } = req.body;
    authService.login({ login, password })
    .then(token => {
      const expires = new Date(Date.now() + (23 * 60 * 60 * 1000));
      res.cookie('token', token, { expires, httpOnly: true });
      const { href } = req.cookies;
      res.cookie('href', '');
      res.json({ href: href || baseUrl });
    })
    .catch(e => {
      logger.info({ message: e.toString() });
      if (!e.status) e.status = 401;
      res.status(e.status).json({ message: e.message });
    });
  }

  logout(req, res) {
    res.cookie('token', '');
    res.end();
  }

  verify(req, res, next) {
    const { token } = req.cookies;
    authService.verify(token)
    .then(() => next())
    .catch(e => {
      logger.info({ message: e.toString() });
      const expires = new Date(Date.now() + (60 * 60 * 1000));
      res.cookie('href', req.originalUrl, { expires, httpOnly: true });
      res.redirect(path.join(baseUrl, 'auth'));
    });
  }
}

module.exports = {
  AuthController,
  authController: new AuthController(),
};
