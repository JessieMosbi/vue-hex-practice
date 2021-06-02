const instance = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io/api/jessiemosbi'
});

const app = Vue.createApp({
  data () {
    return {
      cookieName: 'hexschoolvue',
      products: [],
      targetModal: null,
      tempProduct: {
        imagesUrl: []
      },
      isClickSendBtn: 0, // for 空值提示
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

      // open target modal
      let modalName;
      if (action === 'add' || action === 'edit') modalName = 'productModal';
      else if (action === 'delete') modalName = 'delProductModal';

      this.targetModal = new bootstrap.Modal(document.getElementById(modalName), null);
      this.targetModal.show();
    },

    closeModal () {
      this.targetModal.hide();
    },

    resetValue () {
      this.isClickSendBtn = 0;
      this.targetModal = null;
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

      instance.post(`/admin/product`, { data: this.tempProduct })
        .then(res => {
          if (!res.data.success) {
            alert('新增失敗！');
            return;
          }

          alert('新增成功！');
          this.closeModal();
          this.getData();
          this.resetValue();
        })
        .catch(err => console.dir(err))
    },

    editProduct () {
      this.isClickSendBtn = 1;

      if (!this.tempProduct.title || !this.tempProduct.category || !this.tempProduct.unit || !this.tempProduct.origin_price || !this.tempProduct.price) {
        alert('請檢查必填欄位！');
        return;
      }

      instance.put(`/admin/product/${this.tempProduct.id}`, { data: this.tempProduct })
        .then(res => {
          if (!res.data.success) {
            alert('編輯失敗！');
            return;
          }

          alert('編輯成功！');
          this.closeModal();
          this.getData();
          this.resetValue();
        })
        .catch(err => console.dir(err))
    },

    addPicture () {
      if (this.tempProduct.imagesUrl.length === 5) return;
      this.tempProduct.imagesUrl.push('');
    },

    deletePicture (index) {
      if (index === 'main') this.tempProduct.imageUrl = '';
      else this.tempProduct.imagesUrl.splice(index, 1);
    }
  }
});

import pagination from './pagination-component.js'
app.component('pagination', pagination);

app.component('deleteModal', {
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

          // TODO: 除了 updateData，其餘應該都可移進入來
          // 但因為自己在 deleteModal component new 出來的 modal 跟外層 targetModal 其實是不一樣的 Object（雖然都是指 delete Modal，但是不同 Object 不同 reference），不能真的操作到同一個 modal
          // 加上 openModal 勢必得從 root component 呼叫，若再把 modal 用 props 傳進來會跟 root component 太耦合！失去元件邏輯拆分的意義！所以明天在最外層加上 modal 變數，讓 root component 跟 delete modal component 都可以操作到同一個 modal
          this.$emit('closeModal');
          this.$emit('updateData');
          this.$emit('resetValue');
        })
        .catch(err => console.dir(err))
    },
  }
})

app.mount('#app');

// FIXME: modal 關掉要怎麼 reset value？