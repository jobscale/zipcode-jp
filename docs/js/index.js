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
      if (this.code.length < 4) return;
      this.id = setTimeout(() => this.find(), 200);
    },

    find() {
      logger.info('code', this.code);
      const params = ['/api/find', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: this.code }),
      }];
      fetch(...params)
      .then(res => res.json())
      .then(list => { this.list = list; });
    },

    onColorScheme() {
      const html = document.querySelector('html');
      html.classList.toggle('dark-scheme');
      html.classList.toggle('light-scheme');
    },
  },
}).mount('#app');
