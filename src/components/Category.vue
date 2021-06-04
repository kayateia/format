<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="col-12">
        <h1><router-link :to="categoryLink">{{ name }}{{ colour }}</router-link></h1>
        <topic v-for="t in topics" :topic="t" :key="t.topicId" :topicLink="linkFor(t)" :posts="[]"></topic>
    </div>
</template>

<script lang="ts">

import { Category, Topic } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";
import TopicComponent from "./Topic.vue";

@Component({
    components: {
        Topic: TopicComponent
    }
})
export default class CategoryComponent extends Vue {
    @Prop() private category!: Category;
    @Prop() private topics!: Topic[];
    @Prop() private categoryLink: string | undefined;

    get name() {
        return this.category.name;
    }

    get colour() {
        return this.category.colour;
    }

    linkFor(t: Topic): string {
        return `/cat/${this.category.roomId}/topic/${t.topicId}`;
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
    font-size: 1.8em;
    font-weight: bold;
}

a {
    color: #42b983;
}
</style>
