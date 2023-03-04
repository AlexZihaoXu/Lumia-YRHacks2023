import {GameObject} from './engine';
import {MAP_DOOR_HEIGHT, MAP_TILE_SIZE, MapGenerator} from './MapGenerator';
import {Entity} from './entities';

export class HitboxObject extends GameObject {
    constructor(x: number, y: number, w: number, h: number) {
        super();
        this.hitbox.set(x, y, w, h);
        this.enableCollision = true;

    }

    async onCollision(other: GameObject): Promise<void> {
        await super.onCollision(other);

        if (other instanceof Entity) {
            const direction = this.hitbox.push(other.hitbox);
            if (direction === 0) {
                other.vel.y = Math.min(0, other.vel.y);
            } else if (direction === 1) {
                other.vel.x = Math.min(0, other.vel.x);
            } else if (direction === 2) {
                other.vel.y = Math.max(0.01, other.vel.y);
            } else if (direction === 3) {
                other.vel.x = Math.max(0, other.vel.x);
            }
        }

    }
}

export class LevelObject extends GameObject {
    generator = new MapGenerator(this);
    hitboxes: HitboxObject[] = [];

    public constructor() {
        super();
        this.generator.generate();
        this.zIndex = -1;

        for (let room of this.generator.rooms) {
            // TOP
            this.addHitbox(room.x, room.y, room.width, MAP_TILE_SIZE);

            // BOTTOM
            this.addHitbox(room.x, room.y - MAP_TILE_SIZE + room.height, room.width, MAP_TILE_SIZE);

            if (room.type !== 'hallway') {

                // LEFT
                this.addHitbox(room.x, room.y + MAP_DOOR_HEIGHT - MAP_TILE_SIZE, MAP_TILE_SIZE, room.height - (MAP_DOOR_HEIGHT - MAP_TILE_SIZE) * 2);
                if (room.hasTopleft) this.addHitbox(room.x, room.y, MAP_TILE_SIZE, MAP_DOOR_HEIGHT);
                if (room.hasBottomleft) this.addHitbox(room.x, room.y + room.height - MAP_DOOR_HEIGHT, MAP_TILE_SIZE, MAP_DOOR_HEIGHT);

                // RIGHT
                this.addHitbox(room.x + room.width - MAP_TILE_SIZE, room.y + MAP_DOOR_HEIGHT - MAP_TILE_SIZE, MAP_TILE_SIZE, room.height - (MAP_DOOR_HEIGHT - MAP_TILE_SIZE) * 2);
                if (room.hasTopright) this.addHitbox(room.x + room.width - MAP_TILE_SIZE, room.y, MAP_TILE_SIZE, MAP_DOOR_HEIGHT);
                if (room.hasBottomright) this.addHitbox(room.x + room.width - MAP_TILE_SIZE, room.y + room.height - MAP_DOOR_HEIGHT, MAP_TILE_SIZE, MAP_DOOR_HEIGHT);

            }

        }
    }

    private addHitbox(x: number, y: number, w: number, h: number) {
        const box = new HitboxObject(x, y, w, h);
        this.scene.addGameObject(box);
        this.hitboxes.push(box);
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        for (let room of this.generator.rooms) {
            const tex = await room.getTexture();
            this.ctx.drawImage(tex, room.x, room.y);
        }
    }


}