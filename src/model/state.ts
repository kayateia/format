//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import { Category } from "./category";
import { Homeserver } from "./homeserver";
import { Topic } from "./topic";
import { User } from "./user";

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
    setTopics(topics: Topic[]): void {
        for (const t of topics) {
            this.topics_.set(t.threadId, t);
        }
        this.topicsUpdated_.emitUpdate(topics.map(t => t.threadId));
    }
    get topicsUpdated() { return this.topicsUpdated_; }
}

// The current state of the app.
const currentState = new State();

// Would love EventEmitter...
export interface UpdatedState<T> {
    (t: T, state: State): void;
}
class UpdateEmitter<T> {
    cbs: UpdatedState<T>[] = [];

    onUpdate(callback: UpdatedState<T>) {
        this.cbs.push(callback);
    }

    // For State only.
    emitUpdate(t: T) {
        this.cbs.forEach(c => c(t, currentState));
    }
}

export const current = () => currentState;
