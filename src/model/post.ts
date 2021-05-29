//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Topic } from "./topic";

/*

This is a little complicated (tbd) because topics are technically just posts
with the topic title as the post body. All subsequent (actual) posts to that
topic will have a "reply to" parent in Matrix of the topic post, or another
post in the same topic.

*/

export class PostContents {
    // The Matrix timeline event ID that represents the topic header.
    // This is included in the serialized data to avoid needing to crawl all
    // the way back to the original topic to get its title and other info.
    // Topic header posts won't have a value here.
    private topicId_: string | undefined;

    // The body of this post. This should always contain a plaintext version of the post.
    private body_: string;

    // The HTML body of this post. This may be missing, or it may have a simplified HTML
    // representation of the post, matching the Matrix specs. This is pulled into the
    // serialized data so that it can be more extensible later without an MSC.
    private bodyHtml_?: string;

    constructor(body: string, topicId?: string, bodyHtml?: string) {
        this.topicId_ = topicId;
        this.body_ = body;
        this.bodyHtml_ = bodyHtml;
    }

    get topicId() { return this.topicId_; }
    get body() { return this.body_; }
    get bodyHtml() { return this.bodyHtml_; }
}

// We will post literal JSON of this to Matrix in the matching Category room.
export interface SerializedPost {
    version: string;
    topicId?: string;
    body: string;
    bodyHtml?: string;
}

export interface PostArgs {
    postId?: string;
    parentId?: string;
    pendingTopic?: Topic;
    author: string;
    contents: PostContents | string;
}

// Represents information about a post on a topic.
export class Post {
    // May be undefined if it hasn't been sent.
    private postId_: string | undefined;

    // May be undefined if its topic header hasn't been posted. In
    // that case, pendingTopic_ will be set instead.
    private parentId_: string | undefined;
    private pendingTopic_: Topic | undefined;

    private authorId_: string;
    private contents_: PostContents;

    constructor(args: PostArgs) {
        this.postId_ = args.postId;
        this.parentId_ = args.parentId;
        this.pendingTopic_ = args.pendingTopic;
        this.authorId_ = args.author;

        if (typeof args.contents === "string") {
            const json: SerializedPost = JSON.parse(args.contents);
            this.contents_ = new PostContents(json.body, json.topicId, json.bodyHtml);
        } else {
            this.contents_ = args.contents;
        }
    }

    // Returns a new Post representing the pending topic header.
    pendingTopicHeader(): Post {
        if (!this.pendingTopic_) {
            throw new Error("Can't make a pending topic header due to no pending topic.");
        }
        return new Post({
            author: this.authorId_,
            contents: new PostContents(this.pendingTopic_.title)
        });
    }

    // Returns a new copy of the Post with a topic ID filled in, and no longer pending.
    withTopicId(topicId: string): Post {
        return new Post({
            postId: this.postId_,
            parentId: topicId,
            author: this.authorId_,
            contents: new PostContents(
                this.contents_.body,
                topicId,
                this.contents_.bodyHtml
            )
        });
    }

    // Returns a new copy of the Post with its ID filled in.
    withId(postId: string): Post {
        return new Post({
            postId,
            parentId: this.parentId_,
            author: this.authorId_,
            contents: this.contents_
        });
    }

    get postId() { return this.postId_; }
    get parentId() { return this.parentId_; }
    get pendingTopic() { return this.pendingTopic_; }
    get authorId() { return this.authorId_; }
    get contents() { return this.contents_; }

    get serialized() {
        return {
            version: "fmt1",
            topicId: this.contents.topicId,
            body: this.contents_.body,
            bodyHtml: this.contents_.bodyHtml
        } as SerializedPost;
    }

    static isOurs(serialized: string): boolean {
        let json: SerializedPost;
        try {
            // Skip any quote line we were forced to put in.
            const skip = serialized.lastIndexOf("\n");
            if (skip > 0) {
                serialized = serialized.substr(skip + 1);
            }

            json = JSON.parse(serialized);
            return json?.version === "fmt1";
        } catch (e) {
            return false;
        }
    }

    static parse(serialized: string, id: string, author: string, parentId?: string): Post | undefined {
        let json: SerializedPost;
        try {
            // Skip any quote line we were forced to put in.
            const skip = serialized.lastIndexOf("\n");
            if (skip > 0) {
                serialized = serialized.substr(skip + 1);
            }

            json = JSON.parse(serialized);
        } catch (e) {
            throw new Error(`Couldn't convert from JSON: ${serialized}`);
        }
        if (!json.version) {
            // For now this is just a yes/no flag. In the future, the serialized
            // data structure might need to rev, and we will deal with shimming
            // other formats (heh) here.
            return undefined;
        }
        return new Post({
            postId: id,
            parentId,
            author,
            contents: new PostContents(
                json.body, json.topicId, json.bodyHtml
            )
        });
    }
}
