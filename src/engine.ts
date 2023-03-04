export class AABBHitbox {
    constructor(public x: number, public y: number, public width: number, public height: number) {
    }

    intersection(other: AABBHitbox): AABBHitbox | null {
        const left = Math.max(this.x, other.x);
        const right = Math.min(this.x + this.width, other.x + other.width);
        const top = Math.max(this.y, other.y);
        const bottom = Math.min(this.y + this.height, other.y + other.height);

        if (left < right && top < bottom) {
            return new AABBHitbox(left, top, right - left, bottom - top);
        } else {
            return null;
        }
    }

    containsPoint(point: { x: number, y: number }): boolean;
    containsPoint(x: number, y: number): boolean;
    containsPoint(arg1: number | { x: number, y: number }, arg2?: number): boolean {
        const x = typeof arg1 === 'number' ? arg1 : arg1.x;
        const y = typeof arg1 === 'number' ? arg2 as number : arg1.y;

        return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
    }

    push(hitbox: AABBHitbox) {
        const area = this.intersection(hitbox);
        if (area && area.width != area.height) {
            if (area.width > area.height) {
                if (this.centerY < hitbox.centerY) {
                    hitbox.y = this.bottom;
                    return 2;
                } else {
                    hitbox.y = this.top - hitbox.height;
                    return 0;
                }
            } else {
                if (this.centerX < hitbox.centerX) {
                    hitbox.x = this.right;
                    return 1;
                } else {
                    hitbox.x = this.left - hitbox.width;
                    return 3;
                }
            }
        }
        return -1;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.left + this.width;
    }

    get centerX() {
        return (this.left + this.right) / 2;
    }

    get centerY() {
        return (this.top + this.bottom) / 2;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.top + this.height;
    }

    get w() {
        return this.width;
    }

    set w(w) {
        this.width = w;
    }

    get h() {
        return this.height;
    }

    set h(h) {
        this.height = h;
    }

    toString() {
        return `AABBHitbox{x=${this.x}, y=${this.y}, w=${this.w}, h=${this.height}}`;
    }

    set(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class Vector2 {
    constructor(public x: number = 0, public y: number = 0) {
    }

    public static from(direction: number, magnitude: number) {
        return new Vector2(Math.cos(direction) * magnitude, Math.sin(direction) * magnitude);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get direction() {
        return Math.atan2(this.y, this.x);
    }

    get normalized() {
        const magnitude = this.magnitude;
        return new Vector2(this.x / magnitude, this.y / magnitude);
    }

    mul(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface GameCanvasContext2D extends CanvasRenderingContext2D {
    drawHitbox(rect: AABBHitbox): any;
}

export const Keys = {
    VK_CANCEL: 3,
    VK_HELP: 6,
    VK_BACK_SPACE: 8,
    VK_TAB: 9,
    VK_CLEAR: 12,
    VK_RETURN: 13,
    VK_ENTER: 14,
    VK_SHIFT: 16,
    VK_CONTROL: 17,
    VK_ALT: 18,
    VK_PAUSE: 19,
    VK_CAPS_LOCK: 20,
    VK_ESCAPE: 27,
    VK_SPACE: 32,
    VK_PAGE_UP: 33,
    VK_PAGE_DOWN: 34,
    VK_END: 35,
    VK_HOME: 36,
    VK_LEFT: 37,
    VK_UP: 38,
    VK_RIGHT: 39,
    VK_DOWN: 40,
    VK_PRINTSCREEN: 44,
    VK_INSERT: 45,
    VK_DELETE: 46,
    VK_0: 48,
    VK_1: 49,
    VK_2: 50,
    VK_3: 51,
    VK_4: 52,
    VK_5: 53,
    VK_6: 54,
    VK_7: 55,
    VK_8: 56,
    VK_9: 57,
    VK_SEMICOLON: 59,
    VK_EQUALS: 61,
    VK_A: 65,
    VK_B: 66,
    VK_C: 67,
    VK_D: 68,
    VK_E: 69,
    VK_F: 70,
    VK_G: 71,
    VK_H: 72,
    VK_I: 73,
    VK_J: 74,
    VK_K: 75,
    VK_L: 76,
    VK_M: 77,
    VK_N: 78,
    VK_O: 79,
    VK_P: 80,
    VK_Q: 81,
    VK_R: 82,
    VK_S: 83,
    VK_T: 84,
    VK_U: 85,
    VK_V: 86,
    VK_W: 87,
    VK_X: 88,
    VK_Y: 89,
    VK_Z: 90,
    VK_CONTEXT_MENU: 93,
    VK_NUMPAD0: 96,
    VK_NUMPAD1: 97,
    VK_NUMPAD2: 98,
    VK_NUMPAD3: 99,
    VK_NUMPAD4: 100,
    VK_NUMPAD5: 101,
    VK_NUMPAD6: 102,
    VK_NUMPAD7: 103,
    VK_NUMPAD8: 104,
    VK_NUMPAD9: 105,
    VK_MULTIPLY: 106,
    VK_ADD: 107,
    VK_SEPARATOR: 108,
    VK_SUBTRACT: 109,
    VK_DECIMAL: 110,
    VK_DIVIDE: 111,
    VK_F1: 112,
    VK_F2: 113,
    VK_F3: 114,
    VK_F4: 115,
    VK_F5: 116,
    VK_F6: 117,
    VK_F7: 118,
    VK_F8: 119,
    VK_F9: 120,
    VK_F10: 121,
    VK_F11: 122,
    VK_F12: 123,
    VK_F13: 124,
    VK_F14: 125,
    VK_F15: 126,
    VK_F16: 127,
    VK_F17: 128,
    VK_F18: 129,
    VK_F19: 130,
    VK_F20: 131,
    VK_F21: 132,
    VK_F22: 133,
    VK_F23: 134,
    VK_F24: 135,
    VK_NUM_LOCK: 144,
    VK_SCROLL_LOCK: 145,
    VK_COMMA: 188,
    VK_PERIOD: 190,
    VK_SLASH: 191,
    VK_BACK_QUOTE: 192,
    VK_OPEN_BRACKET: 219,
    VK_BACK_SLASH: 220,
    VK_CLOSE_BRACKET: 221,
    VK_QUOTE: 222,
    VK_META: 224
};

export class Input {
    private mouseButtons = [false, false, false];
    private _mouseX = 0;
    private _mouseY = 0;

    private _keys = {};

    public get game() {
        return;
    }

    public get mouseX() {
        return this._mouseX;
    }

    public get mouseY() {
        return this._mouseY;
    }

    constructor(game: GameCanvas) {
        window.addEventListener('mousedown', ev => {
            if (ev.button >= 0 && ev.button < this.mouseButtons.length)
                this.mouseButtons[ev.button] = true;
        });
        window.addEventListener('mouseup', ev => {
            if (ev.button >= 0 && ev.button < this.mouseButtons.length)
                this.mouseButtons[ev.button] = false;
        });
        window.addEventListener('pointermove', ev => {
            this._mouseX = ev.x;
            this._mouseY = ev.y;
        });
        window.addEventListener('keydown', ev => {
            // @ts-ignore
            this._keys[ev.keyCode] = true;
        });
        window.addEventListener('keyup', ev => {
            // @ts-ignore
            this._keys[ev.keyCode] = false;
        });
    }

    public getKey(key: number): boolean {
        // @ts-ignored
        return this._keys[key] === true;
    }

    public getMouseButton(id: number) {
        if (id <= 0 && id < this.mouseButtons.length)
            return this.mouseButtons[id];
        return false;
    }
}

export class GameCanvas {

    public readonly element = document.createElement('canvas');
    private _input: Input | null = null;
    private static _INSTANCE: GameCanvas | null = null;

    private _currentScene: Scene | null = null;
    private _swappingScene: Scene | null = null;

    public readonly ctx;

    public static getInstance() {
        if (this._INSTANCE === null) {
            this._INSTANCE = new GameCanvas();
        }
        return this._INSTANCE;
    }

    private constructor() {
        this.element.style.backgroundColor = 'black';
        // @ts-ignored
        this.ctx = this.element.getContext('2d') as GameCanvasContext2D;
        this.ctx.drawHitbox = (hitbox: AABBHitbox) => {
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
            this.ctx.restore();
        };
    }

    public addToBodyAndRegisterEvents() {
        document.body.appendChild(this.element);
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';

        const updateCanvasSize = () => {
            this.element.width = innerWidth;
            this.element.height = innerHeight;
        };
        updateCanvasSize();

        window.addEventListener('resize', updateCanvasSize);


        document.addEventListener('contextmenu', e => {
            e.preventDefault();
        }, {passive: false});
        document.addEventListener('mousedown', e => {
            e.preventDefault();
        }, {passive: false});
        const style = document.createElement('style');
        style.innerHTML = `
        * {
            touch-action: manipulation !important;
            -webkit-user-select: none;
            -webkit-touch-callout: none;  
            margin: 0;
            overflow: hidden;
        }
        `;

        this._input = new Input(this);
    }

    get input() {
        return this._input as Input;
    }

    public async onDraw(now: number, dt: number) {
        this.ctx.imageSmoothingEnabled = false;
        if (this.scene) {
            this.ctx.save();
            await this.scene.onDraw(now, dt);
            this.ctx.restore();
        }
    }

    public async onUpdate(now: number, dt: number) {
        if (this.scene) {
            await this.scene.onUpdate(now, dt);
        }
    }

    public async onFixedUpdate(now: number, dt: number) {
        if (this.scene) {
            await this.scene.onFixedUpdate(now, dt);
        }
    }

    public start() {

        const startTime = Date.now();
        let lastUpdateTime = 0;
        let fixedUpdateTime = 0;
        let fixedDeltaTime = 1 / 200;
        const loop = async () => {
            const now = (Date.now() - startTime) / 1000;
            const dt = now - lastUpdateTime;
            lastUpdateTime = now;

            if (this._swappingScene !== null) {
                if (this._currentScene !== null) {
                    await this._currentScene.onCleanup();
                }
                this._currentScene = this._swappingScene;
                this._swappingScene = null;
                await this._currentScene.onSetup();
            }

            while (fixedUpdateTime <= now) {
                await this.onFixedUpdate(fixedUpdateTime, fixedDeltaTime);
                fixedUpdateTime += fixedDeltaTime;
            }

            await this.onUpdate(now, dt);
            await this.onDraw(now, dt);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    get width() {
        return this.element.width;
    }

    get height() {
        return this.element.height;
    }

    get scene() {
        return this._currentScene as Scene;
    }

    set scene(scene: Scene) {
        this._swappingScene = scene;
    }
}

export class Scene {

    protected gameObjects: GameObject[] = [];
    private removeList: GameObject[] = [];

    get game() {
        return GameCanvas.getInstance();
    }

    get ctx() {
        return this.game.ctx;
    }

    get input() {
        return this.game.input;
    }

    public async onSetup() {

    }

    public async onCleanup() {

    }

    public addGameObject(object: GameObject) {
        this.gameObjects.push(object);
    }

    public removeGameObject(object: GameObject) {
        this.removeList.push(object);
    }

    public async onUpdate(now: number, dt: number) {
        for (let object of this.gameObjects) {
            await object.onUpdate(now, dt);
        }
    }

    public async onFixedUpdate(now: number, dt: number) {
        for (let object of this.removeList) {
            const index = this.gameObjects.indexOf(object);
            if (index !== -1)
                this.gameObjects.splice(index, 1);
        }
        for (let object of this.gameObjects) {
            await object.onFixedUpdate(now, dt);
            if (object.enableCollision) {
                for (let other of this.gameObjects) {
                    if (other.enableCollision)
                        if (object.hitbox.intersection(other.hitbox)) {
                            await object.onCollision(other);
                        }
                }
            }
        }
    }

    public async onDraw(now: number, dt: number) {
        this.gameObjects.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });
        for (let object of this.gameObjects) {
            if (object.zIndex > 10) continue;
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
    }

    public get width() {
        return this.game.width;
    }

    public get height() {
        return this.game.height;
    }
}

export class GameObject {
    public hitbox: AABBHitbox = new AABBHitbox(0, 0, 0, 0);
    public anchorPoint = new Vector2(0, 0);

    public zIndex = 0;

    public enableCollision = false;
    public showHitbox = false;

    get input() {
        return this.game.input;
    }

    public get x() {
        return this.hitbox.x - this.anchorPoint.x;
    }

    public get y() {
        return this.hitbox.y - this.anchorPoint.y;
    }

    public set x(x) {
        this.hitbox.x = x + this.anchorPoint.x;
    }

    public set y(y) {
        this.hitbox.y = y + this.anchorPoint.y;
    }

    get game() {
        return GameCanvas.getInstance();
    }

    get scene() {
        return this.game.scene;
    }

    get ctx() {
        return this.game.ctx;
    }


    public async onCollision(other: GameObject) {
    }

    public async onDraw(now: number, dt: number) {

    }

    public async onUpdate(now: number, dt: number) {

    }

    public async onFixedUpdate(now: number, dt: number) {

    }

}

export class Assets {
    private static cacheImages = {};

    public static async getImage(url: string) {
        return new Promise<HTMLImageElement>(async resolve => {
            // @ts-ignored
            if (this.cacheImages[url] === undefined) {
                const image = new Image();
                image.src = url;
                // @ts-ignored
                this.cacheImages[url] = null;
                image.onload = () => {
                    // @ts-ignored
                    this.cacheImages[url] = image;
                    // @ts-ignored
                    resolve(this.cacheImages[url]);
                };
            } else {
                // @ts-ignored
                resolve(this.cacheImages[url]);
            }
        });

    }
}