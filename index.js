const app = Vue.createApp({
  data () {
    return {
      cookieName: 'hexschoolvue',
      API: null,
      products: [],
      targetModal: null,
      tempProduct: {
        imagesUrl: []
      },
      isClickSendBtn: 0, // for 空值提示
      totalPages: 0
    }
  },

  mounted () {
    const token = document.cookie.replace(`/(?:(?:^|.*;\s*)${this.cookieName}\s*\=\s*([^;]*).*$)|^.*$/`, "$1");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    this.API = axios.create({
      baseURL: `https://vue3-course-api.hexschool.io/api/jessiemosbi`,
      headers: { 'Authorization': document.cookie.replace(/(?:(?:^|.*;\s*)hexschoolvue\s*\=\s*([^;]*).*$)|^.*$/, "$1") }
    });

    this.getData();
  },

  methods: {
    getData (page = 1) {
      console.log(`page is ${page}`);

      this.API.get(`/admin/products?page=${page}`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品列表資料失敗！');
            return;
          }

          console.log(res.data);

          this.products = res.data.products;
          this.totalPages = res.data.pagination.total_pages;
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

    deleteProduct () {
      this.API.delete(`/admin/product/${this.tempProduct.id}`)
        .then(res => {
          if (!res.data.success) {
            alert('刪除產品失敗！');
            return;
          }
          alert('成功刪除產品！');

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

    deletePicture (index) {
      if (index === 'main') this.tempProduct.imageUrl = '';
      else this.tempProduct.imagesUrl.splice(index, 1);
    }
  }
});

// 新增 pagination template
// 從外面傳進來，看 page 總共有幾頁，用 for 顯示 <li>
// click pagination (記得要 .prevent or javascript:;)，觸發到外層元件的 getData
// TODO: pagination 要特別加深 (active class) 目前所在的 page
// TODO: 特別情況下，「上一頁/下一頁」不顯示：totalPages = 1 || nowPage = 1 不顯示上一頁，totalPages = 1 || nowPage = lastPage 不顯示下一頁
// TODO: 套一下之前有寫過的 pagination 中間固定只顯示幾頁

app.component('pagination', {
  data () {
    return {

    }
  },
  props: ['totalPages'],
  template: `
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="number in totalPages">
          <a class="page-link" href="javascript:;" @click="$emit('changePage', number)">{{number}}</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  `
});

app.mount('#app');

// FIXME: modal 關掉要怎麼 reset value？