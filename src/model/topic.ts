//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// Represents information about a topic within a category.
export class Topic {
    private categoryId_: string;
    private title_: string;

    // May be undefined if we haven't posted a header for this topic.
    private topicId_: string | undefined;

    constructor(categoryId: string, title: string, topicId?: string) {
        this.categoryId_ = categoryId;
        this.title_ = title;
        this.topicId_ = topicId;
    }

    get categoryId() { return this.categoryId_; }
    get title() { return this.title_; }
    get topicId() { return this.topicId_; }

    withId(topicId: string): Topic {
        return new Topic(this.categoryId_, this.title_, topicId);
    }
}
