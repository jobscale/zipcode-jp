const { App } = require('./app');

const main = () => {
  const pro = {};
  pro.pending = new Promise(resolve => { pro.resolve = resolve; });
  const app = new App().start();
  const options = {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
  };
  app.listen(options, () => {
    logger.info(JSON.stringify({
      Server: 'Started',
      'Listen on': `http://127.0.0.1:${options.port}`,
    }, null, 2));
    pro.resolve(app);
  });
  return pro.pending;
};

module.exports = {
  server: main(),
};
