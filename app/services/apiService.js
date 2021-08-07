const { Slack } = require('@jobscale/slack');
const { Service } = require('./service');

class ApiService extends Service {
  slack(rest) {
    const { text } = rest;
    const param = { text };
    return this.fetchEnv()
    .then(env => new Slack(env).send(param))
    .then(res => ({ ...res, ts: Date.now() }));
  }

  async allowInsecure(use) {
    if (use === false) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  fetchEnv() {
    if (!this.cache) this.cache = {};
    if (this.cache.env) return Promise.resolve(this.cache.env);
    // const Host = 'https://partner.credentials.svc.cluster.local';
    const Host = 'https://127.0.0.1:3443';
    const Cookie = 'X-AUTH=X0X0X0X0X0X0X0X';
    const request = [
      `${Host}/slack.env.json`,
      { method: 'GET', headers: { Cookie } },
    ];
    return this.allowInsecure()
    .then(() => fetch(...request))
    .then(res => this.allowInsecure(false) && res)
    .then(res => res.json())
    .then(env => {
      this.cache.env = env;
      return env;
    });
  }
}

module.exports = {
  ApiService,
  apiService: new ApiService(),
};
