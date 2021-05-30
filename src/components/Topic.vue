<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="col-12">
        <h1>{{ title }}</h1>
        <p class="info">Started by <i>{{ author }}</i> at <i>{{ timestamp }}</i></p>
        <post-view v-for="p in posts" :key="p.postId" :post="p"></post-view>
    </div>
</template>

<script lang="ts">

import { Topic, Post } from "@/model";
import PostView from "@/components/Post.vue";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {
    PostView
  },
})export default class TopicView extends Vue {
    @Prop() private topic: Topic | undefined;
    @Prop() private posts: Post[] | undefined;

    get title() {
        return this.topic?.title;
    }

    get author() {
        return this.topic?.authorId;
    }

    get timestamp() {
        return this.topic?.timestamp?.toLocaleString({
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
