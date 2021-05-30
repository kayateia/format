//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

export interface UserArgs {
    accessToken?: string;
    login?: string;
    displayName?: string | undefined | null;
    avatarMxc?: string | undefined | null;
    avatarUrl?: string | undefined | null;
}

// Represents profile information about a user. If the user is logged
// in (the interactive user), this may also contain an access token.
export class User {
    private accessToken_: string | undefined;
    private login_: string | undefined;
    private displayName_: string | undefined | null;
    private avatarMxc_: string | undefined | null;
    private avatarUrl_: string | undefined | null;

    // This is gross but simplest for the moment...
    loading: boolean = false;

    constructor(args: UserArgs) {
        this.accessToken_ = args.accessToken;
        this.login_ = args.login;
        this.displayName_ = args.displayName;
        this.avatarMxc_ = args.avatarMxc;
        this.avatarUrl_ = args.avatarUrl;
    }

    get accessToken() { return this.accessToken_; }
    get login() { return this.login_; }
    get displayName() { return this.displayName_; }
    get avatarMxc() { return this.avatarMxc_; }
    get avatarUrl() { return this.avatarUrl_; }

    withUpdates(args: UserArgs) {
        return new User(Object.assign({
            accessToken: this.accessToken,
            login: this.login,
            displayName: this.displayName,
            avatarMxc: this.avatarMxc,
            avatarUrl: this.avatarUrl
        } as UserArgs, args));
    }
}
