<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="container">
        <topic :topic="topic" topicLink="" :posts="posts"></topic>
    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from "vue-property-decorator";
import TopicComponent from "@/components/Topic.vue";
import { Topic, currentState, Post } from "@/model";
import { filter, map } from "rxjs/operators";

@Component({
    components: {
        Topic: TopicComponent
    },
    data: {
        topic: null,
        posts: null
    }
})
export default class TopicView extends Vue {
    @Prop() topicId!: string;

    topic?: Topic;
    posts?: Post[];

    constructor() {
        super();

        const state = currentState();
        state.topicsStream.pipe(
            map(ts => ts.filter(t => t.topicId === this.topicId)),
            filter(ts => ts.length > 0)
        ).subscribe(ts => {
            this.topic = ts[0];
            console.log("Updating topic:", this.topicId);
        });

        state.postsStream.pipe(
            map(ps => ps.filter(p => p.contents.topicId === this.topicId)),
            filter(ps => ps.length > 0)
        ).subscribe(ps => {
            this.posts = ps;
            console.log("Updating posts:", this.posts);
        });
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
