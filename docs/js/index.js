import { createApp, reactive } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.min.js';

const logger = console;

const self = reactive({
  findId: undefined,
  loadId: undefined,
  code: '',
  listCode: '',
  list: [],
  selectedCode: '5400002',
  perf: undefined,

  update() {
    if (self.listCode === self.code) return;
    self.listCode = self.code;
    clearTimeout(self.findId);
    if (self.code.length < 3) return;
    const { code } = self;
    self.findId = setTimeout(() => self.find(code), 200);
  },

  find(code) {
    logger.info({ code });
    const params = ['/api/find', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }];
    self.perf = undefined;
    const begin = Date.now();
    self.loading();
    fetch(...params)
    .then(res => {
      if (res.status !== 200) return [];
      return res.json();
    })
    .then(list => {
      self.perf = (Date.now() - begin) / 1000;
      self.list = list;
    })
    .catch(e => logger.error(e))
    .then(() => {
      self.loading(false);
    });
  },

  loading(on) {
    if (on !== false) {
      document.querySelector('.loading').classList.remove('hide');
      return;
    }
    clearTimeout(self.loadId);
    self.loadId = setTimeout(() => {
      document.querySelector('.loading').classList.add('hide');
    }, 1500);
  },

  onColorScheme() {
    const html = document.querySelector('html');
    html.classList.toggle('dark-scheme');
    html.classList.toggle('light-scheme');
  },
});

createApp({
  setup() {
    return self;
  },
}).mount('#app');
