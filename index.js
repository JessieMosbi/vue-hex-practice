// axios
const instance = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io/api/jessiemosbi'
});

// mitt
import 'https://unpkg.com/mitt/dist/mitt.umd.js';
const emitter = mitt();

const app = Vue.createApp({
});

app.component('produceListTable', {
  data () {
    return {
      products: []
    }
  },
  mounted () {
    this.getProducts();
  },
  template: `
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
              <button type="button" class="btn btn-outline-secondary" @click="openModal(product.id)">
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

    getProducts () {
      instance.get(`/products?page=1`)
        .then(res => {
          if (!res.data.success) {
            alert('獲取產品列表資料失敗！');
            return;
          }

          this.products = res.data.products;
        })
        .catch(err => console.dir(err))
    },

    addToCart (productId) {
      emitter.emit('addToCart', productId);
    },

    // TODO:
    openModal (productId) {
      console.log(`openModal(): ${productId}`);
    }
  },
});

app.component('cartListTable', {
  data () {
    return {
      carts: [],
      total: 0,
      final_total: 0
    }
  },
  created () {
    emitter.on('addToCart', (data) => this.addToCart(data));
  },
  mounted () {
    this.getCarts();
  },
  template: `
    <div class="text-end">
      <button class="btn btn-outline-danger" type="button" @click="deleteAllCarts">清空購物車</button>
    </div>
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
  `,
  methods: {
    getCarts () {
      instance.get(`/cart`)
        .then(res => {
          console.log(res.data.data);

          if (!res.data.success) {
            alert('獲取購物車列表資料失敗！');
            return;
          }

          this.carts = res.data.data.carts;
          this.total = res.data.data.total;
          this.final_total = res.data.data.final_total;
        })
        .catch(err => console.dir(err))
    },

    addToCart (productId) {
      const data = {
        "data": {
          "product_id": productId,
          "qty": 1
        }
      }

      instance.post(`/cart`, data)
        .then(res => {

          if (!res.data.success) {
            alert('新增至購物車失敗！');
            return;
          }

          this.getCarts();
        })
        .catch(err => console.dir(err))
    },

    deleteCart (cardId) {
      console.log(`deleteCart() : ${cardId}`);

      instance.delete(`/cart/${cardId}`)
        .then(res => {

          if (!res.data.success) {
            alert('刪除購物車資料失敗！');
            return;
          }

          this.getCarts();
        })
        .catch(err => console.dir(err))
    },

    deleteAllCarts () {
      console.log(`deleteAllCarts()`);

      instance.delete(`/carts`)
        .then(res => {

          if (!res.data.success) {
            alert('清除購物車資料失敗！');
            return;
          }

          this.getCarts();
        })
        .catch(err => console.dir(err))
    }
  },
});

// Enroll vee-validate component
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

// Activate the locale
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

// Add vee-validate rules
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('numeric', VeeValidateRules['numeric']);
VeeValidate.defineRule('min', VeeValidateRules['min']);

app.mount('#app');