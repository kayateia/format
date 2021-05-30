//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import sdk from "matrix-js-sdk";

// Hopefully they will eventually export this.
import { EventType } from "matrix-js-sdk/src/@types/event";
export * from "matrix-js-sdk/src/@types/event";

import { State, current as currentState, Homeserver, User } from "../model";
import * as Updaters from "./updaters";

export class Matrix {
    // There's no typing for this currently.
    private client_: any;
    private homeserver_: Homeserver | undefined;
    private us_: User | undefined;

    constructor() {
        const state = currentState();
        if (state.homeserver) {
            this.homeserver_ = state.homeserver;
        }
        if (state.us) {
            this.us_ = state.us;
        }
        if (this.homeserver_ && this.us_ && this.us_.accessToken) {
            this.connect();
        }
        this.hookLoginInfoChanged_(state);
    }

    private hookLoginInfoChanged_(state: State) {
        state.homeserverChanged.onUpdate(h => {
            // We don't really allow switching servers without a logout.
            if (!this.client_) {
                this.homeserver_ = h;
                if (this.us_ && this.us_.accessToken) {
                    this.connect();
                }
            }
        });
        state.usChanged.onUpdate(us => {
            // TODO Should allow logout.
            if (!this.client_) {
                this.us_ = us;
                if (this.homeserver_ && this.us_ && this.us_.accessToken) {
                    this.connect();
                }
            }
        });
    }

    async getToken(login: string, password: string): Promise<string> {
        if (!this.homeserver_) {
            throw new Error("No homeserver is set, can't get token");
        }

        const url = this.homeserver_.url;
        const client = sdk.createClient(url);
        const regResult = await client.login("m.login.password", {
            user: login,
            password
        });
        console.log(JSON.stringify(regResult, null, 4));

        return regResult.accessToken;
    }

    async connect(): Promise<void> {
        // Do we have an access token?
        const user = this.us_;
        const url = this.homeserver_?.url;

        if (!user || !user.accessToken) {
            throw new Error("Can't connect: there are no user credentials.");
        }
        if (!url) {
            throw new Error("Can't connect: no homeserver set.");
        }

        const login = {
            baseUrl: url,
            accessToken: user.accessToken,
            userId: user.login
        };
        console.log("login:", login);
        const client = sdk.createClient(login);
        console.log("client:", client);

        // client.initCrypto();
        await client.startClient();

        console.log("client started!");

        this.client_ = client;

        const state = currentState();
        state.usersUpdated.onUpdate(users => Updaters.usersUpdated(client, users));

        console.log("starting sync");
        client.once("sync", (state:string , prevState: string, res: any) => {
            try {
                Updaters.syncComplete(state);
            } catch (e) {
                console.error("Error during sync callback", e);
            }
        });

        console.log("hooking timeline events");
        client.on("Room.timeline", async (event: any, room: any, toStartOfTimeline: any) => {
            try {
                await Updaters.roomMessage(client, event, room, toStartOfTimeline);
            } catch (e) {
                console.log("Error during timeline callback", e);
            }
        });

        console.log("processing queued posts");
        const poster = async () => {
            const posts = state.getAndClearPostQueue();
            try {
                await Updaters.sendQueuedPosts(client, posts);
            } catch (e) {
                console.error("Error during post callback", e);
                // This needs some better idempotent state management.
                // state.queuePostsForSend(posts);
            }
        };
        await poster();
        state.postQueueUpdated.onUpdate(poster);
    }
}
