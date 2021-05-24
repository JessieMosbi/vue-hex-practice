const app = {
  data () {
    return {
      cookieName: 'hexschoolvue',
      API: axios.create({
        baseURL: `https://vue3-course-api.hexschool.io/api/jessiemosbi`,
        headers: { 'Authorization': document.cookie.replace(/(?:(?:^|.*;\s*)hexschoolvue\s*\=\s*([^;]*).*$)|^.*$/, "$1") }
      }),
      products: [],
      targetModal: null,
      tempProduct: {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2489&q=80', // 主圖網址
        imagesUrl: [], // 圖片網址一~五
        title: '',
        category: '',
        unit: '',
        origin_price: '',
        price: '',
        description: '',
        content: '',
        is_enabled: 0
      },
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
    },

    openModal (action) {
      console.log(action);

      if (action === 'add') {
        this.targetModal = new bootstrap.Modal(document.getElementById('productModal'), null);

        this.targetModal.show();
      }
    },

    addProduct () {
      console.log('addProduct()!!!');



      const param = {
        data: this.tempProduct
      }

      this.API.post(`/admin/product`, param)
        .then(res => {
          console.log(res);

          if (!res.data.success) {
            alert('新增失敗！');
            return;
          }

          alert('新增成功！');
          this.targetModal.hide();
          this.getData();
        })
        .catch(err => console.dir(err))
    }
  },

  created () {
    this.getData();
  }
}

Vue.createApp(app).mount('#app');