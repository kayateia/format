<!--
//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//
-->

<template>
    <div class="container">
        <category :category="category" categoryLink="" :topics="topics"></category>
    </div>
</template>

<script lang="ts">

import { BehaviorSubject } from "rxjs";
import { map, filter } from "rxjs/operators";
import { Component, Prop, Vue } from "vue-property-decorator";
import CategoryComponent from "@/components/Category.vue";
import { currentState, Category, Topic } from "@/model";

@Component({
    components: {
        Category: CategoryComponent
    },
    data: {
        category: null,
        topics: null
    }
})
export default class CategoryView extends Vue {
    @Prop() catId!: string;

    category: Category | undefined;
    topics: Topic[] | undefined;

    constructor() {
        super();

        const state = currentState();
        state.categoriesStream.pipe(
            map((cs: Category[]) => cs.filter(c => c.roomId === this.catId)),
            filter(cs => cs.length > 0)
        ).subscribe(cs => {
            console.log("Categories update", cs);
            this.category = cs[0];
            this.recalcTopics(this);
        });

        state.topicsStream.subscribe(ts => {
            console.log("Topics update", ts);
            this.recalcTopics(this);
        });
    }

    private recalcTopics(us: CategoryView) {
        console.log("Our category:", us.category, us);
        if (!us.category || !us.category.roomId) {
            return;
        }

        const state = currentState();
        us.topics = state.topicsStream.value.filter(t => t.categoryId === us.catId);
        console.log("Category updating topics:", us.topics);
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
