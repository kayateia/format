//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Category } from "./category";
import { Homeserver } from "./homeserver";
import { Topic } from "./topic";
import { User } from "./user";
import { Post } from "./post";
import { Subject, BehaviorSubject } from "rxjs";

export class State {
    // The Matrix server we're attached directly to.
    private homeserver_ = new BehaviorSubject<Homeserver | undefined>(undefined);

    // Our logged in user, if they are logged in.
    private us_ = new BehaviorSubject<User | undefined>(undefined);

    // Cached information about our user and other users.
    private userMap_ = new Map<string, User>();
    private usersUpdated_ = new Subject<string[]>();

    // List of categories that we know/care about.
    private categories_ = new Map<string, Category>();
    private categoriesStream_ = new BehaviorSubject<Category[]>([]);
    private categoriesUpdated_ = new Subject<string[]>();

    // List of topics that we know/care about.
    private topics_ = new Map<string, Topic>();
    private topicsStream_ = new BehaviorSubject<Topic[]>([]);
    private topicsUpdated_ = new Subject<string[]>();

    // List of posts that we know/care about.
    private posts_ = new Map<string, Post>();
    private postsStream_ = new BehaviorSubject<Post[]>([]);
    private postsUpdated_ = new Subject<string[]>();

    // List of posts that are queued for sending.
    //
    // Generally this list is mutually exclusive with posts_. Everything
    // in here won't have IDs yet, and may contain unposted topic headers.
    // Everything in posts_ and topics_ *will* have IDs.
    private postQueue_ = [] as Post[];
    private postQueueUpdated_ = new Subject<void>();

    get homeserver() { return this.homeserver_.value; }
    setHomeserver(server: Homeserver) {
        this.homeserver_.next(server);
    }
    get homeserverChanged() { return this.homeserver_; }

    get us() { return this.us_.value; }
    setUs(user?: User) {
        this.us_.next(user);
    }
    get usChanged() { return this.us_; }

    getUser(login: string): User | undefined {
        return this.userMap_.get(login);
    }
    setUsers(users: User[]): void {
        if (users.filter(u => !u.login).length > 0) {
            throw new Error(`Unable to set multiple users, as some have no login: ${JSON.stringify(users, null, 4)}`);
        } else {
            for (const u of users) {
                this.userMap_.set(u.login!, u);
            }
            this.usersUpdated_.next(users.map(u => u.login!));
        }
    }
    get usersUpdated() { return this.usersUpdated_; }

    get categories() {
        return this.categoriesStream_.value;
    }
    getCategory(id: string): Category | undefined {
        return this.categories_.get(id);
    }
    setCategories(categories: Category[]): void {
        for (const c of categories) {
            this.categories_.set(c.roomId, c);
        }
        this.categoriesStream_.next([...this.categories_.values()]);
        this.categoriesUpdated_.next(categories.map(c => c.roomId));
    }
    get categoriesStream() { return this.categoriesStream_; }
    get categoriesUpdated() { return this.categoriesUpdated_; }

    get topics() {
        return this.topicsStream_.value;
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
        this.topicsStream_.next([...this.topics_.values()]);
        this.topicsUpdated_.next(topics.map(t => t.topicId!));
    }
    get topicsStream() { return this.topicsStream_; }
    get topicsUpdated() { return this.topicsUpdated_; }

    get posts() {
        return this.postsStream_.value;
    }
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
        this.postsStream_.next([...this.posts_.values()]);
        this.postsUpdated_.next(posts.map(p => p.postId!));
    }
    get postsStream() { return this.postsStream_; }
    get postsUpdated() { return this.postsUpdated_; }

    getAndClearPostQueue(): Post[] {
        const posts = this.postQueue_;
        this.postQueue_ = [];
        return posts;
    }
    queuePostsForSend(posts: Post[]): void {
        this.postQueue_.push(...posts);
        this.postQueueUpdated_.next();
    }
    get postQueueUpdated() { return this.postQueueUpdated_; }
}

// The current state of the app.
const globalState = new State();
if (window) {
    (window as any).currentState = globalState;
}

export const currentState = () => globalState;
