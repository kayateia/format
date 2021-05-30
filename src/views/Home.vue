<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="home container">
        <topic-view :topic="topic" :posts="posts"></topic-view>
    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from "vue-property-decorator";
import TopicView from "@/components/Topic.vue";
import { Topic, current as currentState, Post } from "@/model";

@Component({
    components: {
        TopicView
    },
})
export default class Home extends Vue {
    topic?: Topic | string = "";
    posts: Post[] = [];

    constructor() {
        super();

        const state = currentState();
        this.topic = state.getTopic(tid);
        this.posts = state.getPostsByTopic(tid);
        if (!this.topic) {
            state.topicsUpdated.onUpdate((ts: string[]) => {
                console.log("Home updating topics:", ts);
                if (ts.filter(t => t === tid).length > 0) {
                    this.topic = state.getTopic(tid);
                }
            });
        }
        state.postsUpdated.onUpdate((ps: string[]) => {
            console.log("Home updating posts:", ps);
            this.posts = state.getPostsByTopic(tid);
        });
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.home {
    padding-left: 2em;
    padding-right: 2em;
    padding-top: 2em;
}

</style>
