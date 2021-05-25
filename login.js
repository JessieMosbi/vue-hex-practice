const app = {
  data () {
    return {
      cookieName: 'hexschoolvue',
      API: axios.create({
        baseURL: `https://vue3-course-api.hexschool.io/`
      }),
      username: '',
      password: ''
    }
  },

  methods: {
    login () {
      this.API.post('/admin/signin', {
        username: this.username,
        password: this.password
      })
        .then((res) => {
          if (!res.data.success) {
            alert('登入失敗！');
            return;
          }

          const token = res.data.token;
          const expireTime = new Date(res.data.expired).toUTCString();

          document.cookie = `hexschoolvue=${token};expires=${expireTime}`;
          this.API.defaults.headers.common['Authorization'] = token;

          alert('登入成功！');
          window.location.href = "/";
        })
        .catch(err => console.dir(err))
    },

    checkIfLogin () {
      if (document.cookie.replace(`/(?:(?:^|.*;\s*)${this.cookieName}\s*\=\s*([^;]*).*$)|^.*$/`, "$1")) return 1;
      else return;
    }
  },

  created () {
    if (this.checkIfLogin()) {
      window.location.href = "/";
      return;
    }
  }
}

Vue.createApp(app).mount('#app');