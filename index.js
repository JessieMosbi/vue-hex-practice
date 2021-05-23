const app = {
  data () {
    return {
      cookieName: 'hexschoolvue',
      API: axios.create({
        baseURL: `https://vue3-course-api.hexschool.io/api/jessiemosbi`,
        headers: { 'Authorization': document.cookie.replace(/(?:(?:^|.*;\s*)hexschoolvue\s*\=\s*([^;]*).*$)|^.*$/, "$1") }
      }),
      products: []
    }
  },

  methods: {
    getData () {
      this.API.get(`/admin/products?page=1`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品列表資料失敗！');
            return;
          }

          this.products = res.data.products;
        })
        .catch(err => console.dir(err))
    },

    deleteProduct (id) {
      this.API.delete(`/admin/product/${id}`)
        .then(res => {
          if (!res.data.success) {
            alert('刪除產品失敗！');
            return;
          }

          this.products.splice(this.products.findIndex((product) => product.id === id), 1);
          alert('成功刪除產品！');
        })
        .catch(err => console.dir(err))
    }
  },

  created () {
    this.getData();
  }
}

Vue.createApp(app).mount('#app');