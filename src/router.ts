//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";
import Topic from "@/views/Topic.vue";
import Category from "@/views/Category.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/cat/:catId/topic/:topicId",
    name: "Topic",
    component: Topic,
    props: true
  },
  {
    path: "/cat/:catId",
    name: "Category",
    component: Category,
    props: true
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "./views/About.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
