//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Category } from "./category";
import { v4 as v4uuid } from "uuid";

// Represents information about a topic within a category.
export class Topic {
    private categoryId_: string;
    private title_: string;
    private topicId_: string;

    constructor(category: Category, title: string, topicId: string) {
        this.categoryId_ = category.roomId;
        this.title_ = title;
        this.topicId_ = topicId;
    }

    get categoryId() { return this.categoryId_; }
    get title() { return this.title_; }
    get topicId() { return this.topicId_; }
}

export function newTopicId(): string {
    return `fmttopic-${v4uuid()}`;
}
