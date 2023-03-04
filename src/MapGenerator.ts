import {AABBHitbox, Assets} from './engine';
import {Door, LevelObject, Platform} from './content';

export const MAP_TILE_SIZE = 16;
export const MAP_GAP_SIZE = MAP_TILE_SIZE * 2;
export const MAP_DOOR_HEIGHT = MAP_TILE_SIZE * 4;

export class Room {
    width = 0;
    height = 0;
    hasTopleft = true;
    hasTopright = true;
    hasBottomleft = true;
    hasBottomright = true;
    public static generator: MapGenerator | null = null;
    public generator: MapGenerator | null = null;
    type: 'room' | 'hallway' | 'stairs' = 'room';
    private static canvas = document.createElement('canvas');
    private texture: HTMLImageElement | null = null;

    public constructor(public x = 0, public y = 0) {
        this.width = Math.round(14 + 2 * Math.floor(Math.random() * 5));
        this.height = Math.round(12 + Math.random() * 6);
        this.x -= MAP_TILE_SIZE * Math.round(this.width / 2);
        this.width *= MAP_TILE_SIZE;
        this.height *= MAP_TILE_SIZE;
        this.generator = Room.generator;
    }

    private isWall(x: number, y: number) {
        if (this.generator)
            for (let box of this.generator.levelObject.hitboxes) {
                if (box.hitbox.containsPoint(x, y)) {
                    return true;
                }
            }
        return false;
    }

    public async getTexture(): Promise<HTMLImageElement> {
        if (this.texture === null) {
            const cvs = Room.canvas;
            cvs.width = this.width;
            cvs.height = this.height;
            const ctx = Room.canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.imageSmoothingEnabled = false;
            const wall = await TileSelector.get('res/wall.png');
            const bg = await TileSelector.get('res/background_tiles.png');
            // for (let y = 0; y < this.height; y += MAP_TILE_SIZE) {
            //     for (let x = 0; x < this.width; x += MAP_TILE_SIZE) {
            //         let ox = 0;
            //         let oy = 0;
            //         if (x === 0) ox = -1;
            //         if (x + MAP_TILE_SIZE === this.width) ox = 1;
            //         if (y === 0) oy = -1;
            //         if (y + MAP_TILE_SIZE === this.height) oy = 1;
            //         if (Math.abs(ox) == 1 || Math.abs(oy) == 1) {
            //             ctx.drawImage(wall.get(ox, oy), x, y);
            //         } else {
            //             ctx.drawImage(bg.get(ox, oy), x, y);
            //         }
            //     }
            // }
            for (let y = 0; y < this.height; y += MAP_TILE_SIZE) {
                for (let x = 0; x < this.width; x += MAP_TILE_SIZE) {
                    const tx = x + this.x + MAP_TILE_SIZE / 2;
                    const ty = y + this.y + MAP_TILE_SIZE / 2;

                    if (this.isWall(tx, ty)) {
                        ctx.drawImage(wall.get(0, 0), x, y);
                    } else {
                        ctx.drawImage(bg.get(0, 0), x, y);
                    }

                }
            }
            const image = new Image();
            image.src = cvs.toDataURL();
            this.texture = image;
        }
        return this.texture as HTMLImageElement;
    }
}

export class TileSelector {

    private static caches = {};
    private static canvas = document.createElement('canvas');
    private parts: HTMLImageElement[][] = [];

    private constructor(private readonly rawImage: HTMLImageElement) {
        for (let y = 0; y < 3; y++) {
            this.parts.push([]);
            for (let x = 0; x < 3; x++) {
                this.parts[y].push(this.getCropped(x * 16, y * 16, 16, 16));
            }
        }
    }

    private getCropped(x: number, y: number, w: number, h: number) {
        TileSelector.canvas.width = w;
        TileSelector.canvas.height = h;
        const ctx = TileSelector.canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(this.rawImage, x, y, w, h, 0, 0, w, h);
        const cropped = new Image();
        cropped.src = TileSelector.canvas.toDataURL();
        return cropped;
    }

    public get(x: number, y: number) {
        return this.parts[y + 1][x + 1];
    }

    public static async get(url: string): Promise<TileSelector> {
        // @ts-ignored
        if (this.caches[url] === undefined) {
            const image = await Assets.getImage(url);
            // @ts-ignored
            this.caches[url] = new TileSelector(image);
        }
        // @ts-ignored
        return this.caches[url] as TileSelector;
    }
}

export class MapGenerator {

    rooms: Room[] = [];
    generated = false;

    constructor(public levelObject: LevelObject) {
    }

    generate(depth = 5) {
        Room.generator = this;
        let offsetY = 0;
        for (let i = 0; i < depth; i++) {
            const room = new Room(0, offsetY);
            this.rooms.push(room);
            offsetY += room.height + MAP_GAP_SIZE;
        }
        for (let i = 0; i < depth - 1; i++) {
            const top = this.rooms[i];
            const bottom = this.rooms[i + 1];
            if (Math.random() > 0.5) {

                top.hasBottomright = false;
                bottom.hasTopright = false;

                let room = new Room();
                room.type = 'hallway';
                room.x = top.x + top.width;
                room.y = top.y + top.height - MAP_DOOR_HEIGHT;
                room.width = 12 * MAP_TILE_SIZE - Math.round(top.width / 2);
                room.height = MAP_DOOR_HEIGHT;
                this.rooms.push(room);

                room = new Room();
                room.type = 'hallway';
                room.hasTopright = false;
                room.x = bottom.x + bottom.width;
                room.y = bottom.y;
                room.width = 12 * MAP_TILE_SIZE - Math.round(bottom.width / 2);
                room.height = MAP_DOOR_HEIGHT;
                this.rooms.push(room);

                room = new Room();
                room.type = 'stairs';
                room.hasTopleft = false;
                room.hasBottomleft = false;
                room.x = 12 * MAP_TILE_SIZE;
                room.y = top.y + top.height - MAP_DOOR_HEIGHT;
                room.width = 8 * MAP_TILE_SIZE;
                room.height = MAP_DOOR_HEIGHT * 2 + MAP_GAP_SIZE;
                this.rooms.push(room);

            } else {
                top.hasBottomleft = false;
                bottom.hasTopleft = false;

                let room = new Room();
                room.type = 'hallway';
                room.width = 12 * MAP_TILE_SIZE - Math.round(top.width / 2);
                room.height = MAP_DOOR_HEIGHT;
                room.x = top.x - room.width;
                room.y = top.y + top.height - MAP_DOOR_HEIGHT;
                this.rooms.push(room);

                room = new Room();
                room.type = 'hallway';
                room.hasTopleft = false;
                room.width = 12 * MAP_TILE_SIZE - Math.round(bottom.width / 2);
                room.height = MAP_DOOR_HEIGHT;
                room.x = bottom.x - room.width;
                room.y = bottom.y;
                this.rooms.push(room);

                room = new Room();
                room.type = 'stairs';
                room.hasTopright = false;
                room.hasBottomright = false;
                room.x = -20 * MAP_TILE_SIZE;
                room.y = top.y + top.height - MAP_DOOR_HEIGHT;
                room.width = 8 * MAP_TILE_SIZE;
                room.height = MAP_DOOR_HEIGHT * 2 + MAP_GAP_SIZE;
                this.rooms.push(room);
            }

            this.generated = true;
        }

        for (let room of this.rooms) {
            if (room.type === 'room') {
                if (!room.hasTopleft) this.levelObject.doors.push(new Door(room.x, room.y + MAP_TILE_SIZE));
                if (!room.hasTopright) this.levelObject.doors.push(new Door(room.x + room.width - MAP_TILE_SIZE, room.y + MAP_TILE_SIZE));

                if (!room.hasBottomleft) this.levelObject.doors.push(new Door(room.x, room.y - MAP_TILE_SIZE + room.height - 32));
                if (!room.hasBottomright) this.levelObject.doors.push(new Door(room.x + room.width - MAP_TILE_SIZE, room.y - MAP_TILE_SIZE + room.height - 32));

                this.genPlatforms(room);

            }
        }
    }

    private genPlatforms(room: Room) {
        const platforms = this.levelObject.platforms;
        if (!room.hasTopleft) {
            const len = Math.random() * 2 + 2;
            for (let i = 0; i < len; i++) {
                platforms.push(new Platform(room.x + MAP_TILE_SIZE + i * MAP_TILE_SIZE, room.y + MAP_TILE_SIZE * 3));
            }
        }
        if (!room.hasTopright) {
            const len = Math.random() * 2 + 2;
            for (let i = 0; i < len; i++) {
                platforms.push(new Platform(room.x - MAP_TILE_SIZE * 2 + room.width - i * MAP_TILE_SIZE, room.y + MAP_TILE_SIZE * 3));
            }
        }
        const roomBox = new AABBHitbox(room.x + MAP_TILE_SIZE, room.y + MAP_TILE_SIZE, room.width - MAP_TILE_SIZE * 2, room.height - MAP_TILE_SIZE * 2);
        for (let y = room.y + MAP_TILE_SIZE * 3; y <= room.y + room.height; y += MAP_TILE_SIZE * Math.floor(Math.random() + 3)) {
            for (let x = room.x; x < room.x + room.width; x += MAP_TILE_SIZE * Math.floor(Math.random() * 3 + 4)) {
                if (Math.random() > 0.5) {
                    const len = Math.round(Math.random() * 3 + 4);
                    for (let i = 0; i < len; i++) {
                        const platform = new Platform(x, y);
                        if (!platform.hitbox.intersection(roomBox)) break;
                        platforms.push(platform);
                        x += MAP_TILE_SIZE;
                    }
                    x += MAP_TILE_SIZE;
                }
            }
        }
    }


}