import {GameObject, Vector2} from './engine';
import {Entity} from './entities';

export class TailEffect extends GameObject {

    timer = 0;

    posList: Vector2[] = [];
    lastAdd = 0;
    offset = new Vector2();

    public constructor(public follow: GameObject, public color: string) {
        super();
        this.zIndex = 0.5;
    }

    async onDraw(now: number, dt: number): Promise<void> {
        await super.onDraw(now, dt);
        this.timer += dt;

        if (now - this.lastAdd > 0.01) {
            this.posList.push(new Vector2(this.follow.x + this.offset.x, this.follow.y + this.offset.y));
            this.lastAdd = now;
        }
        while (this.posList.length > 30) {
            this.posList.splice(0, 1);
        }

        this.ctx.save();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineCap = 'round'
        this.ctx.globalCompositeOperation = 'lighter'
        for (let i = 1; i < this.posList.length; i++) {
            this.ctx.globalAlpha = 1 - (this.posList.length - i) / this.posList.length;
            this.ctx.lineWidth = (1 - (this.posList.length - i) / this.posList.length) * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.posList[i - 1].x, this.posList[i - 1].y);
            this.ctx.lineTo(this.posList[i].x, this.posList[i].y);
            this.ctx.stroke();
        }

        this.ctx.restore();

    }
}