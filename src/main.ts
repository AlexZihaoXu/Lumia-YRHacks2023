import {GameCanvas, Scene} from './engine';

class TestScene extends Scene {
    angle = 0;

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.rotate(this.angle);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(-50, -50, 100, 100);
        this.ctx.restore();
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        this.angle += dt;
    }
}

const game = GameCanvas.getInstance();
game.addToBodyAndRegisterEvents();
// @ts-ignored
window.game = game;

game.scene = new TestScene()

game.start();