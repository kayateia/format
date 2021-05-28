//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

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
    private topicId_: string;

    // The body of this post. This should always contain a plaintext version of the post.
    private body_: string;

    // The HTML body of this post. This may be missing, or it may have a simplified HTML
    // representation of the post, matching the Matrix specs. This is pulled into the
    // serialized data so that it can be more extensible later without an MSC.
    private bodyHtml_?: string;

    constructor(topicId: string, body: string, bodyHtml?: string) {
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
    topicId: string;
    body: string;
    bodyHtml?: string;
}

export interface PostArgs {
    postId?: string;
    parentId?: string;
    author: string;
    contents: PostContents | string;
}

// Represents information about a post on a topic.
export class Post {
    // May be undefined if it hasn't been sent.
    private postId_: string | undefined;
    private parentId_: string | undefined;
    private authorId_: string;
    private contents_: PostContents;

    constructor(args: PostArgs) {
        this.postId_ = args.postId;
        this.parentId_ = args.parentId;
        this.authorId_ = args.author;

        if (typeof args.contents === "string") {
            const json: SerializedPost = JSON.parse(args.contents);
            this.contents_ = new PostContents(json.topicId, json.body, json.bodyHtml);
        } else {
            this.contents_ = args.contents;
        }
    }

    get postId() { return this.postId_; }
    get parentId() { return this.parentId_; }
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

    static parse(serialized: string, id: string, author: string, parentId?: string): Post | undefined {
        let json: SerializedPost;
        try {
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
                json.topicId, json.body, json.bodyHtml
            )
        });
    }
}
