<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
  <div id="app">
    <Nav/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.info {
    color: #999;
    font-size: 0.9em;
}

.info i {
    color: #9a9;
    font-weight: bold;
}
</style>

<script lang="ts">

import Nav from "@/components/Nav.vue"; // @ is an alias to /src
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    Nav,
  },
})
export default class App extends Vue { }
</script>
