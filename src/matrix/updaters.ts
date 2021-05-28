//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// This bridges from the SDK callbacks to updating our State.

import { State, current as currentState, Post } from "../model";
import { EventType } from "./sdk";

export function syncComplete(stateCode: string) {
    console.log("sync:", stateCode);
}

export function roomMessage(client: any, event: any, room: any, toStartOfTimeline: boolean) {
    console.log("received timeline event:", event, room, toStartOfTimeline);
    if (event.getType() === EventType.RoomMessage && event.getContent().msgtype === "m.fmtpost") {
        if (event.getContent().body[0] === "!") {
            const body = `I repeat! ${event.getContent().body}`;
            const content = {
                body,
                msgtype: "m.fmtpost",
            };

            /* await */ client.sendEvent(room.roomId, "m.room.message", content, "");
        }

        console.log("Got message:", event.getContent());
    }
}

export async function sendQueuedPosts(client: any, posts: Post[]): Promise<void> {
    console.log("sending queued posts:", posts);
    const events: Promise<any>[] = [];
    const state = currentState();
    for (const p of posts) {
        // Find the topic this post belongs to, to get a room ID.
        const topic = state.getTopic(p.contents.topicId);
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
            body,
            msgtype: "m.text"   // Must be used for server replies to work
        };

        events.push(client.sendEvent(category.roomId, "m.room.message", content, ""));
    }

    console.log("Sending batch of", events.length, "posts...");
    await Promise.all(events);
    console.log("Send complete.");
}
