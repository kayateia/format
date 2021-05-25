//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// Represents information the Matrix server we're connected to.
export class Homeserver {
    private url_: string;

    constructor(url: string) {
        this.url_ = url;
    }

    get url() { return this.url_; }
}
