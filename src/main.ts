import {Assets, GameCanvas, GameObject, Keys, Scene} from './engine';
import {HitboxObject, LevelObject} from './content';
import {Entity} from './entities';



class Player extends Entity {

    public constructor() {
        super();
        this.hitbox.set(-10, -20, 15, 11);
        this.anchorPoint.set(0, 5);
        this.enableCollision = true;
    }

    async onUpdate(now: number, dt: number): Promise<void> {
        await super.onUpdate(now, dt);
        const scene = this.scene as TestScene;
        scene.camera.x += (this.x - scene.camera.x) * Math.min(1, dt * 2);
        scene.camera.y += (this.y - scene.camera.y) * Math.min(1, dt * 2);

    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        if (this.grounded) {
            if (this.input.getKey(Keys.VK_W)) {
                this.vel.y = -270;
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
        this.vel.y += 700 * dt;
        this.vel.x += (-this.vel.x * dt * 4);
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        const slime = await Assets.getImage('res/slime.png');
        this.ctx.translate(6, 16);
        this.ctx.scale(1 - (this.vel.y * 0.0012), 1 + Math.abs(this.vel.y * 0.0011));
        this.ctx.drawImage(slime, -6, -16);
    }

}

class TestScene extends Scene {

    camera = {
        x: 0, y: 0
    };


    async onSetup(): Promise<void> {
        await super.onSetup();
        const player = new Player()
        player.y = 50
        this.addGameObject(player);
        this.addGameObject(new LevelObject());

    }

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(2, 2);
        this.ctx.translate(-this.camera.x, -this.camera.y);


        await super.onDraw(now, dt);

        this.ctx.restore();

        this.ctx.save();

        this.ctx.translate(300, 100);
        this.ctx.scale(2.4, 2.4);


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