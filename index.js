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
      blankProduct: {
        imageUrl: '', // 主圖網址
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
      tempProduct: {
        imageUrl: '', // 主圖網址
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
      isClickSendBtn: 0
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
          console.log(this.products)
        })
        .catch(err => console.dir(err))
    },

    deleteProduct () {
      this.API.delete(`/admin/product/${this.tempProduct.id}`)
        .then(res => {
          if (!res.data.success) {
            alert('刪除產品失敗！');
            return;
          }
          alert('成功刪除產品！');

          this.products.splice(this.products.findIndex((product) => product.id === this.tempProduct.id), 1);
          this.targetModal.hide();
          this.getData();
          this.resetValue();
        })
        .catch(err => console.dir(err))
    },

    openModal (action, id = null) {
      let modalName;
      if (action === 'add' || action === 'edit') modalName = 'productModal';
      else if (action === 'delete') modalName = 'delProductModal';

      if (action === 'edit' && id) {
        this.tempProduct = { ...this.products.find(product => product.id === id) };
        this.tempProduct.num = 1; // FIXME: html 裡面沒數量，先填 1
      }

      if (action === 'edit' || action === 'delete') this.tempProduct.id = id;

      this.targetModal = new bootstrap.Modal(document.getElementById(modalName), null);
      this.targetModal.show();
    },

    addProduct () {
      this.isClickSendBtn = 1;

      if (!this.tempProduct.title || !this.tempProduct.category || !this.tempProduct.unit || !this.tempProduct.origin_price || !this.tempProduct.price) {
        alert('請檢查必填欄位！');
        return;
      }

      // if (this.tempProduct.imagesUrl.filter(image => !image).length > 0) {
      //   alert('不需新增的圖片欄位請刪除');
      //   return;
      // }

      this.API.post(`/admin/product`, { data: this.tempProduct })
        .then(res => {
          if (!res.data.success) {
            alert('新增失敗！');
            return;
          }

          alert('新增成功！');
          this.targetModal.hide();
          this.getData();
          this.resetValue();
        })
        .catch(err => console.dir(err))
    },

    addPicture () {
      if (this.tempProduct.imagesUrl.length === 5) return;
      this.tempProduct.imagesUrl.push('');
    },

    editProduct () {
      this.isClickSendBtn = 1;

      if (!this.tempProduct.title || !this.tempProduct.category || !this.tempProduct.unit || !this.tempProduct.origin_price || !this.tempProduct.price) {
        alert('請檢查必填欄位！');
        return;
      }

      this.API.put(`/admin/product/${this.tempProduct.id}`, { data: this.tempProduct })
        .then(res => {
          if (!res.data.success) {
            alert('編輯失敗！');
            return;
          }

          alert('編輯成功！');
          this.targetModal.hide();
          this.getData();
          this.resetValue();
        })
        .catch(err => console.dir(err))
    },

    resetValue () {
      this.isClickSendBtn = 0;
      this.tempProduct = { ...this.blankProduct };
      this.targetModal = null;
    }
  },

  created () {
    this.getData();
  }
}

Vue.createApp(app).mount('#app');

// FIXME: modal 關掉要怎麼 reset value？