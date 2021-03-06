//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// This bridges from the SDK callbacks to updating our State.

import { currentState, Post, User, Topic, UserArgs } from "../model";
import sdk from "matrix-js-sdk";

// Hopefully they will eventually export this.
import { EventType } from "matrix-js-sdk/src/@types/event";

export function syncComplete(stateCode: string) {
    console.log("sync:", stateCode);
}

export async function roomMessage(client: any, event: any, room: any, toStartOfTimeline: boolean) {
    console.log("received timeline event:", event, room, toStartOfTimeline);
    if (event.getType() === EventType.RoomMessage) {
        const state = currentState();

        // Is it one of ours?
        const content = event.getContent();
        const body = content.body;
        if (!Post.isOurs(body)) {
            return;
        }

        // Topic or post?
        const parentId = content["m.relates_to"]?.["m.in_reply_to"]?.event_id;
        if (parentId) {
            // Post. The event API exposes a Date, we want the millis.
            const post = Post.parse(body, event.getId(), event.getSender(), event.event.origin_server_ts, parentId);
            if (post) {
                console.log("Got post:", post);
                state.setPosts([post]);
            } else {
                console.log("Can't parse post, after all:", post);
            }
        } else {
            // Topic header.
            const post = Post.parse(body, event.getId(), event.getSender(), event.event.origin_server_ts);
            if (post) {
                const topic = Topic.fromPost(room.roomId, post);
                console.log("Got topic:", topic);
                state.setTopics([topic]);
            }
        }

        const userId = event.getSender();
        let userInfo = state.getUser(userId);
        if (!userInfo) {
            userInfo = new User({
                login: userId
            });
            state.setUsers([userInfo]);
        }
    }
}


export async function usersUpdated(client: any, userIds: string[]): Promise<void> {
    const state = currentState();

    const querying: User[] = [];
    for (const uid of userIds) {
        const userInfo = state.getUser(uid);

        if (!userInfo || userInfo.loading) {
            continue;
        }

        userInfo.loading = true;
        querying.push(userInfo);
    }

    if (!querying.length) {
        return;
    }

    const queryPromises = querying.map(u => client.getProfileInfo(u.login));
    const queryResults = await Promise.all(queryPromises);

    const toSet: User[] = [];
    for (const u of querying) {
        const r = queryResults.shift();
        console.log("results:", u, r);

        const url = (sdk as any).getHttpUriForMxc(
            state.homeserver!.url,
            r.avatar_url,
            256, 256,
            "scale",
            /* allow direct links */ false
        );

        const userInfo = u.withUpdates({
            displayName: r.displayname,
            avatarMxc: r.avatar_url,
            avatarUrl: url
        });
        toSet.push(userInfo);
    }
    state.setUsers(toSet);
}

export async function sendQueuedPosts(client: any, posts: Post[]): Promise<void> {
    const state = currentState();
    if (!state.us || !state.us.login) {
        // TODO re-queue stuff.
        console.log("Can't send queued posts, as we have no user info.");
        return;
    }

    console.log("sending queued posts:", posts);
    const events: Promise<any>[] = [];
    const toSet: Post[] = [];
    for (let p of posts) {
        // If there's no topic ID yet, but a pending topic header, then post
        // that first to get its ID. This could be made more efficient by doing
        // waves of updates and Promise.all(), but that seems pointless for one user.
        const pendingTopic = p.pendingTopic;
        if (pendingTopic) {
            // This just becomes a post with the topic name as the contents.
            const topicPost = p.pendingTopicHeader();
            const topicContent = {
                body: JSON.stringify(topicPost.serialized),
                msgtype: "m.text"   // Must be used for server replies to work
            };
            const res = await client.sendEvent(pendingTopic.categoryId, "m.room.message", topicContent, "");
            const id = res.event_id;
            console.log("Created topic", topicPost, "with ID", id);
            p = p.withTopicId(id);
            state.setTopics([pendingTopic.withId(id)]);
        }

        // Find the topic this post belongs to, to get a room ID.
        const topic = state.getTopic(p.contents.topicId!);
        if (!topic) {
            console.error("No topic for post:", p);
            continue;
        }
        const category = state.getCategory(topic.categoryId);
        if (!category) {
            console.error("No category for topic:", topic);
            continue;
        }

        const body = JSON.stringify(p.serialized);
        const content = {
            // This is here because the spec uses MUST, even though we will
            // be the only client that needs to parse this for now. Feels baaad, maaan.
            body: `> <@a:b.c> --elided--\n${body}`,
            format: "org.matrix.custom.html",
            formatted_body: `<mx-reply></mx-reply>\n${body}`,
            "m.relates_to": {
                "m.in_reply_to": {
                    event_id: p.parentId
                }
            },
            msgtype: "m.text"   // Must be used for server replies to work
        };

        events.push((async () => {
            const res = await client.sendEvent(category.roomId, "m.room.message", content, "");
            const id = res.event_id;
            console.log("Created post", p, "with ID", id);
            toSet.push(p.withId(id));
        })());
    }

    console.log("Sending batch of", events.length, "posts...");
    await Promise.all(events);
    console.log("Updating state with sent posts.");
    state.setPosts(toSet);
    console.log("Send complete.");
}
