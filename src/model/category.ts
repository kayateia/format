//
// Copyright (c) 2021 Kayateia
// Please see README.md in the root of this project for licence info.
//

// Represents information about a topic category.
export class Category {
    private roomId_: string;
    private name_: string;
    private colour_: string | undefined;

    constructor(roomId: string, name: string, colour?: string) {
        this.roomId_ = roomId;
        this.name_ = name;
        this.colour_ = colour;
    }

    get roomId() { return this.roomId_ }
    get name() { return this.name_ }
    get colour() { return this.colour_; }
}
