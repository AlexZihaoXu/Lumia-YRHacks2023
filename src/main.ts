import {AABBHitbox, GameCanvas, Keys, Scene} from './engine';



class TestScene extends Scene {

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);



        this.ctx.restore();
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {

    }
}

const game = GameCanvas.getInstance();
game.addToBodyAndRegisterEvents();
// @ts-ignored
window.game = game;

game.scene = new TestScene();

game.start();