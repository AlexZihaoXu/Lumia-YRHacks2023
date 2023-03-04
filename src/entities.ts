import {Assets, GameObject, Keys, Vector2} from './engine';
import {Arrow, Bow} from './combat';
import {LevelScene} from './content';

export class Entity extends GameObject {
    enableCollision = true;
    vel = new Vector2();
    zIndex = 1;
    flipped = false;
    private _grounded = false;
    slowDownSpeedMultiplier = 4;
    autoFlip = true;

    public health = 1;
    private lastDamageTime = 0;

    public damage(reduction: number) {
        this.lastDamageTime = Date.now();
        this.health = Math.max(0, this.health - reduction);
    }

    get isAlive() {
        return this.health > 0;
    }

    get grounded() {
        if (this.vel.y < 0) this._grounded = false;
        return this._grounded;
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        this.y += this.vel.y * dt;
        this.x += this.vel.x * dt;
        this.vel.y += 700 * dt;
        this.vel.x += (-this.vel.x * dt * this.slowDownSpeedMultiplier);
    }

    async onDraw(now: number, dt: number): Promise<void> {
        const damaged = Date.now() - this.lastDamageTime < 300;
        if (damaged) {
            this.ctx.globalCompositeOperation = 'lighter';
        }
        if (this.autoFlip) {
            if (this.vel.x > 0) {
                this.flipped = false;
            }
            if (this.vel.x < 0) {
                this.flipped = true;
            }
        }
        if (this.flipped)
            this.ctx.scale(-1, 1);
        this.ctx.save();
        if (damaged) {
            for (let i = 0; i < 8; i++) {
                await super.onDraw(now, dt);
            }
        }
        await super.onDraw(now, dt);
        this.ctx.restore();
    }


}

export class Player extends Entity {
    constructor() {
        super();
        this.hitbox.set(0, 0, 10, 18);
        this.anchorPoint.set(-5, 0);
    }

    autoFlip = false;

    bow = new Bow(this);

    lastFire = 0;

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        if (this.input.getKey(Keys.VK_W) || this.input.getKey(Keys.VK_UP)) {
            if (this.grounded) {
                this.vel.y = -250;
            }
            this.vel.y -= dt * 250;
        }
        if (this.input.getKey(Keys.VK_A) || this.input.getKey(Keys.VK_LEFT)) {
            this.vel.x = -150;
        }
        if (this.input.getKey(Keys.VK_D) || this.input.getKey(Keys.VK_RIGHT)) {
            this.vel.x = 150;
        }

        if (this.input.getMouseButton(0)) {
            if (now - this.lastFire > 0.03) {
                this.lastFire = now;
                const arrow = new Arrow();
                arrow.x = this.hitbox.centerX + Math.cos(this.bow.direction) * 5 - 12;
                arrow.y = this.hitbox.centerY + Math.sin(this.bow.direction) * 3;
                arrow.x += Math.cos(this.bow.direction) * 9;
                arrow.y += Math.sin(this.bow.direction) * 9;
                arrow.vel = Vector2.from(this.bow.direction, 440);
                this.scene.addGameObject(arrow);
            }
        }
    }

    async onDraw(now: number, dt: number): Promise<void> {
        this.flipped = (this.scene as LevelScene).mouseWorldX < this.hitbox.centerX;
        await super.onDraw(now, dt);
        this.ctx.translate(0, 18);
        this.ctx.scale(1 - (this.vel.y * 0.0006), 1 + Math.abs(this.vel.y * 0.0008));
        this.ctx.scale(1, 1 + Math.sin(now * 5) * 0.04);
        this.ctx.drawImage(await Assets.getImage('res/player-0.png'), -7, -18);
    }


}

export class Enemy extends Entity {
    sleeping = true;

    get player() {
        return (this.scene as LevelScene).player;
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        if (!this.sleeping) await this.onAIUpdate(now, dt);
        if (!this.isAlive)
            this.zIndex = 0.5;
        return super.onFixedUpdate(now, dt);
    }

    async onAIUpdate(now: number, dt: number) {

    }
}


export class Slime extends Enemy {
    animationOffset = Math.random() * Math.PI;

    nextJumpTime = 0;
    slowDownSpeedMultiplier = 6;
    type = Math.round(Math.random());

    constructor() {
        super();
        this.hitbox.set(-10, -20, 15, 11);
        this.anchorPoint.set(-8, 5);
    }

    async onAIUpdate(now: number, dt: number): Promise<void> {
        await super.onAIUpdate(now, dt);
        if (!this.isAlive) return;
        if (this.grounded)
            if (now - this.nextJumpTime > 0) {
                this.nextJumpTime = now + Math.random() * 2 + 0.5;
                this.vel.y = -260;
                if (Math.random() > 0.4) {
                    if (this.player.x > this.x) {
                        this.vel.x = 340;
                    } else {
                        this.vel.x = -340;
                    }
                } else {
                    this.vel.x = (Math.round(Math.random() * 4) - 2) * 160;
                }
            } else {
                if (this.nextJumpTime - now < 0.3) {
                    this.animationOffset += dt * 50;
                }
            }
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);

        this.ctx.translate(0, 16);
        if (this.isAlive) {
            this.ctx.scale(1, 1 + Math.sin(now * 5 + this.animationOffset) * 0.1);
            this.ctx.scale(1 - (this.vel.y * 0.0012), 1 + Math.abs(this.vel.y * 0.0011));
        }
        if (this.isAlive) {
            if (this.type === 0)
                this.ctx.drawImage(await Assets.getImage('res/slime.png'), -8, -16);
            if (this.type === 1)
                this.ctx.drawImage(await Assets.getImage('res/slime2.png'), -8, -16);
        } else {
            if (this.type === 0)
                this.ctx.drawImage(await Assets.getImage('res/slime_dead.png'), -8, -16);
            if (this.type === 1)
                this.ctx.drawImage(await Assets.getImage('res/slime2_dead.png'), -8, -16);
        }
    }
}
