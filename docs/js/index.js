const logger = console;

Vue.createApp({
  data() {
    return {
      id: undefined,
      code: '',
      list: [],
    };
  },

  methods: {
    update() {
      clearTimeout(this.id);
      if (this.code.length < 3) return;
      this.id = setTimeout(() => this.find(), 200);
    },

    find() {
      logger.info('code', this.code);
      const params = ['/api/find', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: this.code }),
      }];
      this.loading();
      fetch(...params)
      .then(res => res.json())
      .then(list => { this.list = list; })
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
      setTimeout(() => {
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
