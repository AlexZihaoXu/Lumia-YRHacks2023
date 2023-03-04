import {Assets, GameObject, Vector2} from './engine';
import {Enemy, Player} from './entities';
import {HitboxObject, LevelScene} from './content';
import {TailEffect} from './effects';

export class Bow extends GameObject {
    constructor(public player: Player) {
        super();
        this.zIndex = 2;
        this.enableCollision = false;
    }

    direction = 0;

    async onDraw(now: number, dt: number): Promise<void> {
        this.x = this.player.x;
        this.y = this.player.y;


        const scene = this.scene as LevelScene;

        await super.onDraw(now, dt);
        this.ctx.translate(4 * (scene.mouseWorldX < this.player.x ? -1 : 1), 11);
        this.ctx.scale(0.85, 0.85);

        this.direction = Math.atan2(scene.mouseWorldY - 11 - this.y, scene.mouseWorldX - this.x);
        this.ctx.rotate(this.direction);
        this.ctx.drawImage(await Assets.getImage('res/bow.png'), -3, -8);

    }
}

export class Arrow extends GameObject {

    enableCollision = true;
    vel = new Vector2();

    bounceCount = 0;

    // tail = new TailEffect(this, 'rgba(197,168,62,0.68)')

    constructor() {
        super();
        this.zIndex = 3;
        this.hitbox.set(0, 40, 4, 4);
        this.anchorPoint.set(11, 0);
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        this.y += this.vel.y * dt;
        this.x += this.vel.x * dt;
        this.vel.y += dt * 700;
    }

    async onCollision(other: GameObject): Promise<void> {
        await super.onCollision(other);
        let deleted = false;
        if (other instanceof Enemy && other.isAlive) {
            other.damage(0.3);
            other.vel.x += this.vel.x * 0.3;
            other.vel.y += this.vel.y * 0.1 - 40;
            deleted = true;
        }
        if (other instanceof HitboxObject) {
            const direction = other.hitbox.push(this.hitbox);
            if (direction === 0) {
                this.vel.y = -Math.abs(this.vel.y);
            }
            if (direction === 2) {
                this.vel.y = Math.abs(this.vel.y);
            }
            if (direction === 1) {
                this.vel.x = Math.abs(this.vel.x);
            }
            if (direction === 3) {
                this.vel.x = -Math.abs(this.vel.x);
            }
            this.bounceCount++;
        }
        if (this.bounceCount > 2) {
            deleted = true;
        }
        if (deleted) {
            this.scene.removeGameObject(this);
        }

    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        this.ctx.translate(12, 2.5);
        this.ctx.rotate(Math.atan2(this.vel.y, this.vel.x));
        this.ctx.drawImage(await Assets.getImage('res/arrow.png'), -12, -2.5);
    }
}