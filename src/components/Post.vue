<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="container">
        <div class="postbox row align-items-start">
            <div class="col col-md-3 col-12 order-md-9 userinfo">
                <div class="userpic"><img :src="avatarUrl"/></div>
            </div>
            <div class="col col-md-9 col-12 content">
                <p class="info"><i>{{ author }}</i> at <i>{{ timestamp }}</i></p>
                <hr/>
                <p>{{ text }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { Post, current as currentState } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class PostView extends Vue {
    @Prop() private post!: Post;

    get author() {
        return this.post.authorId;
    }

    get timestamp() {
        return this.post.timestamp.toLocaleString({
            weekday: 'short',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get text() {
        return this.post.contents.body;
    }

    get avatarUrl() {
        const state = currentState();
        const user = state.getUser(this.post.authorId);
        return user?.avatarUrl;
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.postbox {
    background-color: rgb(34, 39, 51);
    color: #bbb;
    border-radius: 10px;
    padding: 10px;
}

h1 {
    font-size: 1.3em;
    font-weight: bold;
}

a {
  color: #42b983;
}

hr {
    width: 100%;
    border-top: 1px dotted #777;
}

.content {
}

.userinfo {
    border-left-style: dotted;
    border-left-width: 1px;
    border-left-color: #777;
}

.userpic {
    width: 8em;
    height: 8em;
    border-style: dotted;
}

.userpic img {
    width: 8em;
    height: 8em;
}

</style>
