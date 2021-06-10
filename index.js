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
  //   console.log(this.$refs) // 只有 cart-list-table (ref 不同層取不到的問題，這個是在 root component 底下才取得到)
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
  template: `
    <teleport to="#product-list-table" v-if="isMounted">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th>功能</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in products" :key="index">
            <td style="width: 200px">
              <div :style="getImageStyle(product.imageUrl)" v-if="product.imagesUrl"></div>
            </td>
            <td>
              {{product.title}}
            </td>
            <td>
              <div class="h5">{{product.origin_price}} 元</div>
              <del class="h6">原價 {{product.origin_price}} 元</del>
              <div class="h5">現在只要 {{product.price}} 元</div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary" @click="getProduct(product.id)">
                  <i class="fas fa-pulse"></i>
                  查看更多
                </button>
                <button type="button" class="btn btn-outline-danger" @click="addToCart(product.id)">
                  <i class="fas fa-pulse"></i>
                  加到購物車
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </teleport>

    <teleport to="#product-list-pagination" v-if="isMounted">
      <pagination :total-pages="page.total" :current-page="page.current" :has-pre-page="page.hasPre"
        :has-next-page="page.hasNext" @change-page="getProducts"></pagination>
    </teleport>

    <teleport to="#product-list-loading" v-if="isMounted">
      <loading :active="isLoading" :is-full-page="false"></loading>
    </teleport>
  `,
  methods: {
    // FIXME: 應該有更好的方法~
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
  template: `
    <teleport to="#cart-delete-div" v-if="isMounted">
      <div class="text-end">
        <button class="btn btn-outline-danger" type="button" @click="deleteAllCarts">清空購物車</button>
      </div>
    </teleport>
    <teleport to="#cart-list-table" v-if="isMounted">
      <table class="table align-middle">
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th style="width: 150px">數量/單位</th>
            <th>單價</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cart in carts" :key="cart.id">
            <td>
              <button type="button" class="btn btn-outline-danger btn-sm" @click="deleteCart(cart.id)">
                <i class="fas fa-pulse"></i>
                x
              </button>
            </td>
            <td>
              {{cart.product.title}}
              <div class="text-success" v-if="cart.coupon">
                已套用優惠券
              </div>
            </td>
            <td>
              <div class="input-group input-group-sm">
                {{cart.qty}} / 個
              </div>
            </td>
            <td class="text-end">
              {{cart.product.origin_price}}
              <small class="text-success">折扣價：</small>
              {{cart.product.price}}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-end">總計</td>
            <td class="text-end">{{total}}</td>
          </tr>
          <tr>
            <td colspan="3" class="text-end text-success">折扣價</td>
            <td class="text-end text-success">{{final_total}}</td>
          </tr>
        </tfoot>
      </table>
    </teleport>

    <teleport to="#cart-list-loading" v-if="isMounted" :is-full-page="false">
      <loading :active="isLoading" :is-full-page="false"></loading>
    </teleport>
  `,
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

      // check 購物車有無商品 // FIXME: 抓不到 ref 耶！？
      // console.log(this.$refs['cart-list-table'].carts.length);
      // if (this.$refs['cart-list-table'].carts.length === 0) {
      //   alert('購物車內無商品可結帳！');
      //   return;
      // }
      // 所以我在 cart component 加了一個 watch，裡面放 mitt，發更新購物車數量的事件。並在 orderInfo 加上監聽
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