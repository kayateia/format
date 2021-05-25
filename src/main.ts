//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

// import 'bootstrap/dist/css/bootstrap.css';
import "./scss/custom.scss";
import "bootstrap-vue/dist/bootstrap-vue.css";

import "../node_modules/matrix-js-sdk/dist/browser-matrix";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
