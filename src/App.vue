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
  text-align: center;
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
