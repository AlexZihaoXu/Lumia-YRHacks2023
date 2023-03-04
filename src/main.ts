import {GameCanvas, GameObject, Keys, Scene, Vector2} from './engine';


class TestGround extends GameObject {
    public constructor(x: number, y: number, width: number, height: number) {
        super();
        this.hitbox.set(x, y, width, height);
        this.enableCollision = true;
    }

    async onCollision(other: GameObject): Promise<void> {
        await super.onCollision(other);
        if (other instanceof Player) {
            this.hitbox.push(other.hitbox);
            other.vel.y = Math.min(0, other.vel.y);
        }
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        this.ctx.fillStyle = '#69dc57';
        this.ctx.fillRect(0, 0, this.hitbox.width, this.hitbox.height);
    }
}

class Player extends GameObject {

    grounded = false;
    vel = new Vector2();

    public constructor() {
        super();
        this.hitbox.set(-10, -20, 20, 30);
        this.enableCollision = true;
    }

    async onCollision(other: GameObject): Promise<void> {
        await super.onCollision(other);

        if (other instanceof TestGround) {
            if (other.y > this.y)
                this.grounded = true;
        }
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        if (this.grounded) {
            if (this.input.getKey(Keys.VK_W)) {
                this.vel.y = -200;
                this.grounded = false;
            }
        }
        if (this.input.getKey(Keys.VK_A)) {
            this.vel.x += (-200 - this.vel.x) * Math.min(1, dt * 10);
        }
        if (this.input.getKey(Keys.VK_D)) {
            this.vel.x += (200 - this.vel.x) * Math.min(1, dt * 10);
        }
        this.y += this.vel.y * dt;
        this.x += this.vel.x * dt;
        this.vel.y += 400 * dt;
        this.vel.x += (-this.vel.x * dt * 4);
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        this.ctx.fillStyle = '#d1ab11';
        this.ctx.fillRect(0, 0, 20, 30);
    }

}

class TestScene extends Scene {

    async onSetup(): Promise<void> {
        await super.onSetup();
        this.addGameObject(new TestGround(-150, 25, 300, 12));
        this.addGameObject(new TestGround(-120, 0, 30, 12));
        this.addGameObject(new Player());
    }

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(2, 2);

        await super.onDraw(now, dt);

        this.ctx.restore();
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
    }
}

const game = GameCanvas.getInstance();
game.addToBodyAndRegisterEvents();
// @ts-ignored
window.game = game;

game.scene = new TestScene();

game.start();