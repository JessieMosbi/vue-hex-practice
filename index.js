// axios
const instance = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io/api/jessiemosbi'
});

// mitt
import 'https://unpkg.com/mitt/dist/mitt.umd.js';
const emitter = mitt();

// import other component
import pagination from './component/pagination.js'

const app = Vue.createApp({
  // mounted () {
  //   console.log(this.$refs) // 只有 cart-list-table (這裡的 ref 只能取到在 root component 直接下層的 component)
  // }
});

app.component('product', {
  data () {
    return {
      isMounted: false,
      isLoading: true,
      products: [],
      page: {
        total: 0,
        current: 0,
        hasPre: false,
        hasNext: false
      }
    }
  },
  components: {
    pagination
  },
  mounted () {
    this.isMounted = true;
    this.getProducts();
  },
  template: '#product-list',
  methods: {
    // FIXME: 應該有更好的方法，但 :style 整個卡住 url 寫不進去，只好用這樣呼叫 method 的方式處理
    getImageStyle (url) {
      return {
        height: '100px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url("${url}")`
      }
    },

    getProducts (page = 1) {
      this.showLoading(true);

      instance.get(`/products?page=${page}`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品列表資料失敗！');
            this.showLoading(false);
            return;
          }

          this.products = res.data.products;
          this.page.total = res.data.pagination.total_pages;
          this.page.current = res.data.pagination.current_page;
          this.page.hasPre = res.data.pagination.has_pre;
          this.page.hasNext = res.data.pagination.has_next;
          this.showLoading(false);
        })
        .catch(err => console.dir(err))
    },

    getProduct (productId) {
      instance.get(`/product/${productId}`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品詳細資料失敗！');
            return;
          }

          emitter.emit('openProductModal', res.data.product);
        })
        .catch(err => console.dir(err))
    },

    addToCart (productId) {
      emitter.emit('addToCart', { id: productId, qty: 1 });
    },

    showLoading (isShow) {
      this.isLoading = isShow;
    }
  },
});

app.component('cart', {
  data () {
    return {
      isMounted: false,
      isLoading: false,
      carts: [],
      total: 0,
      final_total: 0
    }
  },
  created () {
    emitter.on('addToCart', (data) => this.addToCart(data));
    emitter.on('updateCarts', () => this.getCarts());
  },
  mounted () {
    // This can be easily fixed by only rendering the teleport portion only after the component is mounted.
    // fix this error: Failed to locate Teleport target with selector  Note the target element must exist before the component is mounted
    // 但是練習的範例就不會欸，為什麼？是因為作業的 component code 比較多，所以不一定趕在 target Dom 之前 mounted 完嗎？
    this.isMounted = true;
    this.getCarts();
  },
  watch: {
    carts () {
      emitter.emit('updateCartAmount', this.carts.length);
    }
  },
  template: '#cart-list',
  methods: {
    getCarts () {
      this.showLoading(true);

      instance.get(`/cart`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取購物車列表資料失敗！');
            return;
          }

          this.carts = res.data.data.carts;
          this.total = res.data.data.total;
          this.final_total = res.data.data.final_total;
          this.showLoading(false);
        })
        .catch(err => console.dir(err))
    },

    addToCart (product) {
      this.showLoading(true);

      const data = {
        "data": {
          "product_id": product.id,
          "qty": +product.qty
        }
      }

      instance.post(`/cart`, data)
        .then(res => {

          if (!res.data.success) {
            alert('新增至購物車失敗！');
            this.showLoading(false);
            return;
          }

          this.getCarts();
          emitter.emit('closeProductModal');
        })
        .catch(err => console.dir(err))
    },

    deleteCart (cardId) {
      this.showLoading(true);

      instance.delete(`/cart/${cardId}`)
        .then(res => {

          if (!res.data.success) {
            alert('刪除購物車資料失敗！');
            this.showLoading(false);
            return;
          }

          this.getCarts();
        })
        .catch(err => console.dir(err))
    },

    deleteAllCarts () {
      this.showLoading(true);

      instance.delete(`/carts`)
        .then(res => {

          if (!res.data.success) {
            alert('清除購物車資料失敗！');
            this.showLoading(false);
            return;
          }

          this.getCarts();
        })
        .catch(err => console.dir(err))
    },

    showLoading (isShow) {
      this.isLoading = isShow;
    }
  },
});

app.component('order', {
  data () {
    return {
      isMounted: false,
      isLoading: false,
      user: {
        email: '',
        name: '',
        tel: '',
        address: ''
      },
      message: '',
      cartsAmount: 0
    }
  },
  created () {
    emitter.on('updateCartAmount', (data) => this.cartsAmount = data);
  },
  mounted () {
    this.isMounted = true;
  },
  template: '#order-info',
  methods: {
    sendForm () {
      this.showLoading(true);

      // === check 購物車有無商品
      // FIXME: 抓不到 ref cart-list-table，this.$refs 只抓的到在直接下層的 ref（像 cart-list-table 屬於 root component，那只有在 root component 才能取得這 ref）
      // console.log(this.$refs['cart-list-table'].carts.length);
      // if (this.$refs['cart-list-table'].carts.length === 0) {
      //   alert('購物車內無商品可結帳！');
      //   return;
      // }

      // 因為無法用 ref，所以我在 cart component 加了一個 watch，裡面放 mitt，發更新購物車數量的事件。並在 orderInfo 加上監聽
      if (this.cartsAmount === 0) {
        alert('購物車內無商品可結帳！');
        this.showLoading(false);
        return;
      }

      const data = {
        "data": {
          "user": this.user,
          "message": this.message
        }
      }

      instance.post(`/order`, data)
        .then(res => {

          if (!res.data.success) {
            alert('新增訂單失敗！');
            this.showLoading(false);
            return;
          }
          alert('成功送出訂單！');

          // Object.keys(this.user).forEach(item => this.user[item] = '');
          // 清掉最外層 component 的 errors data (直接 console.log(this.$refs['user-form']); 才找到)
          this.$refs['user-form'].resetForm();
          this.message = ''; // vee-validate 沒辦法用 textarea

          emitter.emit('updateCarts');
          this.showLoading(false);
        })
        .catch(err => console.dir(err))
    },

    showLoading (isShow) {
      this.isLoading = isShow;
    }
  },
});

app.component('productModal', {
  data () {
    return {
      modal: null,
      product: {},
      addToCartQty: 1
    }
  },
  created () {
    emitter.on('openProductModal', (data) => {
      this.product = { ...data };
      this.openModal();
      console.log('here!')
      console.log(this.product)
      console.log(this.product.title)
    });

    emitter.on('closeProductModal', () => {
      this.closeModal();
    });
  },
  mounted () {
    this.modal = new bootstrap.Modal(this.$refs.productModal, null);
  },
  template: '#product-modal',
  methods: {
    openModal () {
      this.modal.show();
    },

    closeModal () {
      this.modal.hide();
    },

    addToCart () {
      emitter.emit('addToCart', { id: this.product.id, qty: this.addToCartQty });
    }
  },
});

// Enroll global components
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
app.component('loading', VueLoading);

// vee-validate setting: Activate the locale, vee-validate rules
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('numeric', VeeValidateRules['numeric']);
VeeValidate.defineRule('min', VeeValidateRules['min']);

app.mount('#app');