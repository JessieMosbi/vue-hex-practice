const instance = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io/api/jessiemosbi'
});

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

    // TODO:
    addToCart (productId) {
      console.log(`addToCart(): ${productId}`);
    },

    // TODO:
    openModal (productId) {
      console.log(`openModal(): ${productId}`);
    }
  },
})

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