//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// Represents profile information about a user. If the user is logged
// in (the interactive user), this may also contain an access token.
export class User {
    private accessToken_: string | undefined;
    private login_: string | undefined;
    private icon_: string | undefined;

    constructor(accessToken?: string, login?: string, icon?: string) {
        this.accessToken_ = accessToken;
        this.login_ = login;
        this.icon_ = icon;
    }

    get accessToken() { return this.accessToken_; }
    get login() { return this.login_; }
    get icon() { return this.icon_; }
}
