const instance = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io/api/jessiemosbi'
});

let delProductModal;
let productModal;

const app = Vue.createApp({
  data () {
    return {
      cookieName: 'hexschoolvue',
      products: [],
      tempProduct: {
        imagesUrl: []
      },
      isClickSendBtn: 0, // for 空值提示
      nowAction: '',
      page: {
        total: 0,
        current: 0,
        hasPre: false,
        hasNext: false
      }
    }
  },

  mounted () {
    const token = document.cookie.replace(`/(?:(?:^|.*;\s*)${this.cookieName}\s*\=\s*([^;]*).*$)|^.*$/`, "$1");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    instance.defaults.headers.common['Authorization'] = document.cookie.replace(/(?:(?:^|.*;\s*)hexschoolvue\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    this.getData();
  },

  methods: {
    getData (page = 1) {
      console.log(`page is ${page}`);

      instance.get(`/admin/products?page=${page}`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品列表資料失敗！');
            return;
          }

          console.log(res.data);

          this.products = res.data.products;
          this.page.total = res.data.pagination.total_pages;
          this.page.current = res.data.pagination.current_page;
          this.page.hasPre = res.data.pagination.has_pre;
          this.page.hasNext = res.data.pagination.has_next;
        })
        .catch(err => console.dir(err))
    },

    openModal (action, id = null) {
      // tempProduct 設定，imagesUrl 預設先給 blank array，這樣前台 add picture 可以直接 push
      if (action === 'add') {
        this.tempProduct = { imagesUrl: [] };
      }
      else if ((action === 'edit' || action === 'delete') && id) {
        this.tempProduct = { ...this.products.find(product => product.id === id) };
        this.tempProduct.id = id;
        if (this.tempProduct.imagesUrl === undefined) this.tempProduct.imagesUrl = [];
      }
      this.tempProduct.num = 1; // html 裡面沒數量，先填 1

      this.nowAction = action; // 紀錄目前動作 (productModal 判斷 add/edit 會用到)

      // open target modal
      if (action === 'add' || action === 'edit') productModal.show();
      else if (action === 'delete') delProductModal.show();
    }
  }
});

import pagination from './component/pagination.js'
app.component('pagination', pagination);

app.component('deleteModal', {
  mounted () {
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), null);
  },
  props: ['tempProduct'],
  template: '#deleteModal',
  methods: {
    deleteProduct () {
      instance.delete(`/admin/product/${this.tempProduct.id}`)
        .then(res => {
          if (!res.data.success) {
            alert('刪除產品失敗！');
            return;
          }
          alert('成功刪除產品！');

          delProductModal.hide();
          this.$emit('updateData');
        })
        .catch(err => console.dir(err))
    },
  }
})

app.component('productModal', {
  data () {
    return {
      isClickSendBtn: 0
    }
  },
  mounted () {
    productModal = new bootstrap.Modal(document.getElementById('productModal'), null);
  },
  props: ['tempProduct', 'action'],
  template: '#productModal',
  methods: {
    editProduct () {
      console.log(`now user action is ${this.action}`);

      this.isClickSendBtn = 1;

      if (!this.tempProduct.title || !this.tempProduct.category || !this.tempProduct.unit || !this.tempProduct.origin_price || !this.tempProduct.price) {
        alert('請檢查必填欄位！');
        return;
      }

      if (this.action === 'add') {
        instance.post(`/admin/product`, { data: this.tempProduct })
          .then(res => {
            if (!res.data.success) {
              alert('新增失敗！');
              return;
            }
            alert('新增成功！');

            productModal.hide();
            this.$emit('updateData');
            this.isClickSendBtn = 0;
          })
          .catch(err => console.dir(err))
      }
      else if (this.action === 'edit') {
        instance.put(`/admin/product/${this.tempProduct.id}`, { data: this.tempProduct })
          .then(res => {
            if (!res.data.success) {
              alert('編輯失敗！');
              return;
            }
            alert('編輯成功！');

            productModal.hide();
            this.$emit('updateData');
            this.isClickSendBtn = 0;
          })
          .catch(err => console.dir(err))
      }
    },

    addPicture () {
      // 雖然 props 是 readonly，但因 Object by reference 特性，還是可以修改裡面的值
      if (this.tempProduct.imagesUrl.length === 5) return;
      this.tempProduct.imagesUrl.push('');
    },

    deletePicture (index) {
      if (index === 'main') this.tempProduct.imageUrl = '';
      else this.tempProduct.imagesUrl.splice(index, 1);
    }
  }
})

app.mount('#app');

// FIXME: modal 關掉要怎麼 reset value？