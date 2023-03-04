import {GameObject, Vector2} from './engine';

export class Entity extends GameObject {
    enableCollision = true;
    vel = new Vector2();

    get grounded() {
        return this.vel.y >= 0 && Math.abs(this.vel.y) < 0.01;
    }


}