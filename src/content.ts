import {AABBHitbox, Assets, GameObject, Scene} from './engine';
import {MAP_DOOR_HEIGHT, MAP_TILE_SIZE, MapGenerator, Room} from './MapGenerator';
import {Entity, Player} from './entities';
import {TailEffect} from './effects';

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
                // @ts-ignored
                other._grounded = true;
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

export class Door extends HitboxObject {
    enableCollision = false;
    showHitbox = false;

    locked = false;

    constructor(x: number, y: number) {
        super(x, y, 16, 32);

    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        if (this.locked)
            this.ctx.drawImage(await Assets.getImage('res/door-closed.png'), 2, 0);
        else
            this.ctx.drawImage(await Assets.getImage('res/door-opened.png'), -6, 0);

    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        this.enableCollision = this.locked;

    }
}

export class Platform extends HitboxObject {

    showHitbox = false;

    constructor(x: number, y: number) {
        super(x, y, 16, 6);
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        this.ctx.drawImage(await Assets.getImage('res/platform.png'), 0, 0);
    }
}

export class TitleObject extends GameObject {
    counter = 0;

    constructor(public readonly title: string) {
        super();
        this.zIndex = 20;
    }

    async onUpdate(now: number, dt: number): Promise<void> {
        await super.onUpdate(now, dt);

        this.x = this.scene.width / 2;
        this.y = this.scene.height * 0.25;
        this.counter += dt * 1.3;

        if (this.counter > 3) {
            this.scene.removeGameObject(this);
        }
    }

    async onDraw(now: number, dt: number): Promise<void> {

        await super.onDraw(now, dt);
        this.counter += dt * 0.3;

        const v = Math.max(0, Math.min(1, this.counter));
        const v2 = Math.min(1, 15 * v * v * (v - 1) * (v - 1));
        const scale = v2 * v2 * 0.2 + 1;

        this.ctx.globalAlpha = v * v * v;
        this.ctx.scale(scale, scale);

        if (this.counter > 2) {
            this.ctx.globalAlpha = Math.max(0, 3 - this.counter);
        }

        this.ctx.font = '140px Gamer';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(this.title, -this.ctx.measureText(this.title).width / 2 + 5, 5);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(this.title, -this.ctx.measureText(this.title).width / 2, 0);

    }
}

export class LevelObject extends GameObject {
    generator = new MapGenerator(this);
    hitboxes: HitboxObject[] = [];
    doors: Door[] = [];

    platforms: Platform[] = [];

    clearAnimation = 0;

    lock() {
        for (let door of this.doors) {
            door.locked = true;
        }
    }

    unlock() {
        for (let door of this.doors) {
            door.locked = false;
        }
    }

    public constructor(public player: Player) {
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

        for (let door of this.doors) {
            this.scene.addGameObject(door);
        }

        for (let platform of this.platforms) {
            this.scene.addGameObject(platform);
        }

        for (let room of this.generator.rooms) {
            if (room === this.generator.rooms[0])
                continue;
            if (room.type === 'room')
                room.spawnEnemies(this);
        }
    }

    private addHitbox(x: number, y: number, w: number, h: number) {
        const box = new HitboxObject(x, y, w, h);
        this.scene.addGameObject(box);
        this.hitboxes.push(box);
    }

    async onDraw(now: number, dt: number): Promise<void> {

        this.ctx.save();
        await super.onDraw(now, dt);
        this.clearAnimation += dt * 0.3;
        for (let room of this.generator.rooms) {
            const tex = await room.getTexture();
            this.ctx.drawImage(tex, room.x, room.y);
        }
        this.ctx.restore();


    }

    combatRoom: Room | null = null;

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        if (!this.combatRoom) {
            for (let room of this.generator.rooms) {
                if (room.isClear) continue;
                const rect = new AABBHitbox(room.x + MAP_TILE_SIZE, room.y + MAP_TILE_SIZE, room.width - MAP_TILE_SIZE * 2, room.height - MAP_TILE_SIZE * 2);
                const int = rect.intersection(this.player.hitbox);
                if (int) {
                    if (int.w * int.h > 20) {
                        this.combatRoom = room;
                        room.wakeup();
                        this.lock();
                    }
                }
            }
        } else {
            if (this.combatRoom && this.combatRoom.isClear) {
                this.combatRoom = null;
                this.unlock();
                this.scene.addGameObject(new TitleObject('CLEAR'));
            }
        }
    }


}

export class LevelScene extends Scene {

    camera = {
        x: 0, y: 0,
        zoom: 4
    };

    public player = new Player();


    get mouseWorldX() {
        return (this.input.mouseX - this.width / 2) / this.camera.zoom + this.camera.x;
    }

    get mouseWorldY() {
        return (this.input.mouseY - this.height / 2) / this.camera.zoom + this.camera.y;
    }

    async onSetup(): Promise<void> {
        await super.onSetup();
        this.player.y = 50;
        this.addGameObject(this.player);
        this.addGameObject(this.player.bow);
        this.addGameObject(new LevelObject(this.player));
        const tail = new TailEffect(this.player, '#ffffff88');
        tail.offset.set(0, 8)
        this.addGameObject(tail);

    }

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        await super.onDraw(now, dt);

        this.ctx.restore();

        this.ctx.save();

        this.ctx.translate(300, 100);
        this.ctx.scale(2.4, 2.4);


        this.ctx.restore();

        for (let object of this.gameObjects) {
            if (object.zIndex <= 10) continue;
            this.ctx.save();
            this.ctx.translate(object.x, object.y);
            await object.onDraw(now, dt);
            this.ctx.restore();
            if (object.showHitbox) {
                this.ctx.save();
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 1.5;
                this.ctx.drawHitbox(object.hitbox);
                this.ctx.restore();
            }
        }

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        const vignette = await Assets.getImage('res/vignette.png');
        this.ctx.drawImage(vignette, 0, 0, this.width, this.height);
        this.ctx.restore();

    }

    async onUpdate(now: number, dt: number): Promise<void> {
        await super.onUpdate(now, dt);
        this.camera.x += (this.player.x - this.camera.x) * Math.min(1, dt * 2);
        this.camera.y += (this.player.y - this.camera.y) * Math.min(1, dt * 2);

    }


    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);

    }
}