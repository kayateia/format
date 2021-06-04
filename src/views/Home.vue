<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="container">
        <category v-for="c in categories" :category="c" :key="c.roomId" :categoryLink="catlink(c)"></category>
    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from "vue-property-decorator";
import { Category, currentState } from "@/model";
import CategoryComponent from "@/components/Category.vue";

@Component({
    components: {
        Category: CategoryComponent
    }
})
export default class Home extends Vue {
    categories: Category[] = [];

    constructor() {
        super();

        const state = currentState();
        state.categoriesStream.subscribe(cs => {
            this.categories = cs;
            console.log("Home updated:", this.categories);
        });
    }

    catlink(c: Category): string {
        return `/cat/${c.roomId}`;
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
