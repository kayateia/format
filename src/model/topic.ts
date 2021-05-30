//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { DateTime } from "luxon";
import { Post } from "./post";

export interface TopicArgs {
    categoryId: string;
    title: string;
    topicId?: string;
    authorId: string;
    timestamp: DateTime;
}

// Represents information about a topic within a category.
export class Topic {
    private categoryId_: string;
    private title_: string;
    private authorId_: string;
    private timestamp_: DateTime;

    // May be undefined if we haven't posted a header for this topic.
    private topicId_: string | undefined;

    constructor(args: TopicArgs) {
        this.categoryId_ = args.categoryId;
        this.title_ = args.title;
        this.topicId_ = args.topicId;
        this.authorId_ = args.authorId;
        this.timestamp_ = args.timestamp;
    }

    get categoryId() { return this.categoryId_; }
    get title() { return this.title_; }
    get topicId() { return this.topicId_; }
    get authorId() { return this.authorId_; }
    get timestamp() { return this.timestamp_; }

    static fromPost(roomId: string, p: Post): Topic {
        return new Topic({
            categoryId: roomId,
            title: p.contents.body,
            topicId: p.postId,
            authorId: p.authorId,
            timestamp: p.timestamp
        });
    }

    withId(topicId: string): Topic {
        return new Topic({
            categoryId: this.categoryId_,
            title: this.title_,
            author: this.author_,
            timestamp: this.timestamp_,
            topicId
        });
    }
}
