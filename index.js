const app = Vue.createApp({
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