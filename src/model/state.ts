//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Category } from "./category";
import { Homeserver } from "./homeserver";
import { Topic } from "./topic";
import { User } from "./user";
import { Post } from "./post";

// Would love EventEmitter...
export interface UpdatedState<T> {
    (t: T, state: State): void;
}
export class UpdateEmitter<T> {
    cbs: UpdatedState<T>[] = [];

    constructor() {}

    onUpdate(callback: UpdatedState<T>) {
        this.cbs.push(callback);
    }

    // For State only.
    emitUpdate(t: T) {
        this.cbs.forEach(c => c(t, currentState));
    }
}

export class State {
    // The Matrix server we're attached directly to.
    private homeserver_: Homeserver | undefined;
    private homeserverUpdated_ = new UpdateEmitter<Homeserver>();

    // Our logged in user, if they are logged in.
    private us_: User | undefined;
    private usChanged_ = new UpdateEmitter<User | undefined>();

    // Cached information about our user and other users.
    private userMap_ = new Map<string, User>();
    private usersUpdated_ = new UpdateEmitter<string[]>();

    // List of categories that we know/care about.
    private categories_ = new Map<string, Category>();
    private categoriesUpdated_ = new UpdateEmitter<string[]>();

    // List of topics that we know/care about.
    private topics_ = new Map<string, Topic>();
    private topicsUpdated_ = new UpdateEmitter<string[]>();

    // List of posts that we know/care about.
    private posts_ = new Map<string, Post>();
    private postsUpdated_ = new UpdateEmitter<string[]>();

    // List of posts that are queued for sending.
    //
    // Generally this list is mutually exclusive with posts_. Everything
    // in here won't have IDs yet, and may contain unposted topic headers.
    // Everything in posts_ and topics_ *will* have IDs.
    private postQueue_ = [] as Post[];
    private postQueueUpdated_ = new UpdateEmitter<void>();

    get homeserver() { return this.homeserver_; }
    setHomeserver(server: Homeserver) {
        this.homeserver_ = server;
        this.homeserverUpdated_.emitUpdate(server);
    }
    get homeserverChanged() { return this.homeserverUpdated_; }

    get us() { return this.us_; }
    setUs(user?: User) {
        this.us_ = user;
        this.usChanged_.emitUpdate(user);
    }
    get usChanged() { return this.usChanged_; }

    getUser(login: string): User | undefined {
        return this.userMap_.get(login);
    }
    setUsers(users: User[]): void {
        if (users.filter(u => !!u.login).length > 0) {
            throw new Error(`Unable to set multiple users, as some have no login: ${JSON.stringify(users, null, 4)}`);
        } else {
            for (const u of users) {
                this.userMap_.set(u.login!, u);
            }
            this.usersUpdated_.emitUpdate(users.map(u => u.login!));
        }
    }
    get usersUpdated() { return this.usersUpdated_; }

    get categories() {
        return [...this.categories_.values()];
    }
    getCategory(id: string): Category | undefined {
        return this.categories_.get(id);
    }
    setCategories(categories: Category[]): void {
        for (const c of categories) {
            this.categories_.set(c.roomId, c);
        }
        this.categoriesUpdated_.emitUpdate(categories.map(c => c.roomId));
    }
    get categoriesUpdated() { return this.categoriesUpdated_; }

    get topics() {
        return [...this.topics_.values()];
    }
    getTopic(id: string): Topic | undefined {
        return this.topics_.get(id);
    }
    setTopics(topics: Topic[]): void {
        if (topics.filter(t => !t.topicId).length > 0) {
            throw new Error(`Unable to set topics, as some have no ID: ${JSON.stringify(topics, null, 4)}`);
        }
        for (const t of topics) {
            this.topics_.set(t.topicId!, t);
        }
        this.topicsUpdated_.emitUpdate(topics.map(t => t.topicId!));
    }
    get topicsUpdated() { return this.topicsUpdated_; }

    getPostsByTopic(topicId: string): Post[] {
        return Array.from(this.posts_.values()).filter(p => p.contents.topicId === topicId);
    }
    setPosts(posts: Post[]): void {
        if (posts.filter(p => !p.postId).length > 0) {
            throw new Error(`Unable to set posts, as some have no ID: ${JSON.stringify(posts, null, 4)}`);
        }
        for (const p of posts) {
            this.posts_.set(p.postId!, p);
        }
        this.postsUpdated_.emitUpdate(posts.map(p => p.postId!));
    }
    get postsUpdated() { return this.postsUpdated_; }

    getAndClearPostQueue(): Post[] {
        const posts = this.postQueue_;
        this.postQueue_ = [];
        return posts;
    }
    queuePostsForSend(posts: Post[]): void {
        this.postQueue_.push(...posts);
        this.postQueueUpdated_.emitUpdate();
    }
    get postQueueUpdated() { return this.postQueueUpdated_; }
}

// The current state of the app.
const currentState = new State();
if (window) {
    (window as any).currentState = currentState;
}

export const current = () => currentState;
