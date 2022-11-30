const os = require('os');
const path = require('path');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const { logger } = require('@jobscale/logger');
const { route } = require('./route');

const app = express();

class App {
  useParser() {
    app.use(express.static(path.join(process.cwd(), 'docs')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
  }

  useHeader() {
    app.set('etag', false);
    app.set('x-powered-by', false);
    app.use((req, res, next) => {
      const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
      res.header('Access-Control-Allow-Origin', `${origin}`);
      res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Server', 'acl-ingress-k8s');
      res.header('X-Backend-Host', os.hostname());
      next();
    });
  }

  useLogging() {
    app.use((req, res, next) => {
      const ts = new Date().toLocaleString();
      const progress = () => {
        const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const { protocol, method, url } = req;
        const headers = JSON.stringify(req.headers);
        logger.info({
          ts, remoteIp, protocol, method, url, headers,
        });
      };
      progress();
      res.on('finish', () => {
        const { statusCode, statusMessage } = res;
        const headers = JSON.stringify(res.getHeaders());
        logger.info({
          ts, statusCode, statusMessage, headers,
        });
      });
      next();
    });
  }

  useRoute() {
    app.use('', route.router);
  }

  notfoundHandler() {
    app.use((req, res) => {
      if (req.method === 'GET') {
        const e = createError(404);
        res.locals.e = e;
        res.status(e.status).send(e.message);
        return;
      }
      const e = createError(501);
      res.status(e.status).json({ message: e.message });
    });
  }

  errorHandler() {
    app.use((e, req, res, done) => {
      (never => never)(done);
      if (!e.status) e.status = 503;
      if (req.method === 'GET') {
        res.locals.e = e;
        res.status(e.status).send(e.message);
        return;
      }
      res.status(e.status).json({ message: e.message });
    });
  }

  start() {
    this.useParser();
    this.useHeader();
    this.useLogging();
    this.useRoute();
    this.notfoundHandler();
    this.errorHandler();
    return app;
  }
}

module.exports = {
  App,
};
