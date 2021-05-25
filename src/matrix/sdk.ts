//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

import sdk from "matrix-js-sdk";

// Hopefully they will eventually export this.
import { EventType } from "matrix-js-sdk/src/@types/event";

import { State, current as currentState, Homeserver, User } from "../model";

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
            userId: "user"
        };
        const client = sdk.createClient(login);

        // client.initCrypto();
        await client.startClient();
        this.client_ = client;

        client.once("sync", (state:string , prevState: string, res: any) => {
        });

        client.on("Room.timeline", (event: any, room: any, toStartOfTimeline: any) => {
            if (event.getType() === EventType.RoomMessage) {
                console.log("Got message:", event.getContents());
            }
        });
    }
}
