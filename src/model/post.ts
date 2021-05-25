//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Topic } from "./topic";
import { v4 as v4uuid } from "uuid";

export class PostContents {
    private id_: string;
    private topicId_: string;
    private body_: string;
    private parentId_: string | undefined;

    constructor(id: string, topicId: string, body: string, parentId?: string) {
        this.id_ = id;
        this.topicId_ = topicId;
        this.body_ = body;
        this.parentId_ = this.parentId_;
    }

    get id() { return this.id_; }
    get topicId() { return this.topicId_; }
    get body() { return this.body_; }
    get parentId() { return this.parentId_; }
}

// We will post literal JSON of this to Matrix in the matching Category room.
export interface SerializedPost {
    id: string;
    topicId: string;
    parentId?: string;
    body: string;
}

// Represents information about a post on a topic.
export class Post {
    private topicId_: string;
    private authorId_: string;
    private contents_: PostContents;

    constructor(topic: Topic | string, author: string, contents: PostContents | string) {
        if (typeof topic === "string") {
            this.topicId_ = topic;
        } else {
            this.topicId_ = topic.threadId;
        }

        this.authorId_ = author;

        if (typeof contents === "string") {
            const json: SerializedPost = JSON.parse(contents);
            this.contents_ = new PostContents(json.id, json.topicId, json.body, json.parentId);
        } else {
            this.contents_ = contents;
        }
    }

    get topicId() { return this.topicId_; }
    get authorId() { return this.authorId_; }
    get contents() { return this.contents_; }

    get serialized() {
        return {
            id: this.contents_.id,
            topicId: this.contents.topicId,
            body: this.contents_.body,
            parentId: this.contents_.parentId
        } as SerializedPost;
    }
}

export function newPostId(): string {
    return `fmtpost-${v4uuid()}`;
}
