//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import sdk from "matrix-js-sdk";
import { zip } from "rxjs";

import { State, currentState, Homeserver, User } from "../model";
import * as Updaters from "./updaters";

export class Matrix {
    // There's no typing for this currently.
    private client_: any;

    constructor() {
        const state = currentState();
        zip(state.homeserverChanged, state.usChanged).subscribe(hu => {
            const homeserver = hu[0];
            const us = hu[1];
            if (homeserver && us && us.accessToken) {
                this.connect(homeserver, us);
            } else {
                if (this.client_) {
                    this.client_.close();
                    this.client_ = undefined;
                }
            }
        });
    }

    async getToken(homeserver: Homeserver, login: string, password: string): Promise<string> {
        const url = homeserver.url;
        const client = sdk.createClient(url);
        const regResult = await client.login("m.login.password", {
            user: login,
            password
        });
        console.log(JSON.stringify(regResult, null, 4));

        return regResult.accessToken;
    }

    async connect(homeserver: Homeserver, user: User): Promise<void> {
        // Do we have an access token?
        const url = homeserver.url;

        if (!user.accessToken) {
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
        state.usersUpdated.subscribe(users => Updaters.usersUpdated(client, users));

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
        state.postQueueUpdated.subscribe(poster);
    }
}
