import {AABBHitbox, Assets, Scene} from './engine';
import {LevelScene, TitleObject} from './content';

export class MenuScene extends Scene {

    readonly playButton = new AABBHitbox(0, 0, 100, 100);
    v = -0.3;

    async onSetup(): Promise<void> {
        await super.onSetup();
    }

    async onDraw(now: number, dt: number): Promise<void> {
        this.ctx.save();
        this.ctx.fillStyle = 'gray';
        this.ctx.fillRect(0, 0, this.width, this.height);
        const v = 1 - Math.min(1, Math.max(0, this.v));
        this.ctx.globalAlpha = 1 - v * v * v;

        const title = await Assets.getImage('res/title.png');
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.translate(this.width / 2, this.height * 0.25 - (20 * v * v * v * v));
        this.ctx.scale(0.5, 0.5);
        this.ctx.drawImage(title, -title.width / 2, -title.height / 2);
        this.ctx.restore();

        this.ctx.fillStyle = 'red';
        this.playButton.set(
            this.width / 2 - 120, this.height * 0.25 + 200 + (20 * v * v * v * v), 240, 65
        );
        this.ctx.fillStyle = '#ffb75e';
        this.ctx.fillRect(
            this.playButton.x, this.playButton.y, this.playButton.w, this.playButton.h
        );
        this.ctx.font = '128px Gamer';
        this.ctx.fillStyle = '#9f371a';
        this.ctx.fillText('PLAY', this.playButton.x + 20 + 3, this.playButton.y + 54 + 3);
        this.ctx.fillStyle = '#cf3e16';
        this.ctx.fillText('PLAY', this.playButton.x + 20, this.playButton.y + 54);
        this.ctx.restore();
        await super.onDraw(now, dt);
    }

    async onFixedUpdate(now: number, dt: number): Promise<void> {
        await super.onFixedUpdate(now, dt);
        this.v += dt * 0.8;
        this.v = Math.min(1, this.v);
        if (this.playButton.containsPoint(this.input.mouseX, this.input.mouseY) && this.input.getMouseButton(0)) {
            this.game.scene = new LevelScene();
        }
    }
}