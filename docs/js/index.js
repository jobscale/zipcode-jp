const logger = console;

Vue.createApp({
  data() {
    return {
      findId: undefined,
      loadId: undefined,
      code: '',
      listCode: '',
      list: [],
      perf: undefined,
    };
  },

  methods: {
    update() {
      if (this.listCode === this.code) return;
      this.listCode = this.code;
      clearTimeout(this.findId);
      if (this.code.length < 3) return;
      const { code } = this;
      this.findId = setTimeout(() => this.find(code), 200);
    },

    find(code) {
      logger.info({ code });
      const params = ['/api/find', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }];
      this.perf = undefined;
      const begin = Date.now();
      this.loading();
      fetch(...params)
      .then(res => {
        if (res.status !== 200) return [];
        return res.json();
      })
      .then(list => {
        this.perf = (Date.now() - begin) / 1000;
        this.list = list;
      })
      .catch(e => logger.error(e))
      .then(() => {
        this.loading(false);
      });
    },

    loading(on) {
      if (on !== false) {
        this.$refs.loading.classList.remove('hide');
        return;
      }
      clearTimeout(this.loadId);
      this.loadId = setTimeout(() => {
        this.$refs.loading.classList.add('hide');
      }, 1500);
    },

    onColorScheme() {
      const html = document.querySelector('html');
      html.classList.toggle('dark-scheme');
      html.classList.toggle('light-scheme');
    },
  },
}).mount('#app');
