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

import * as Model from "./model";

const state = Model.current();

// Make some fake/test forum structure.
state.setCategories([category]);
/*const topic = new Model.Topic(category, "Test topic", Model.newTopicId());
state.setTopics([topic]);*/
const post = new Model.Post({
  postId: undefined,
  parentId: undefined,
  pendingTopic: new Model.Topic(category.roomId, "Test topic!"),
  contents: new Model.PostContents(
    "This is a test post, whee!"
  )
});
state.queuePostsForSend([post]);

import { Matrix } from "./matrix/sdk";

const matrix = new Matrix();
