export class GameCanvas {

    public readonly element = document.createElement('canvas');

    private static _INSTANCE: GameCanvas | null = null;

    private _currentScene: Scene | null = null;
    private _swappingScene: Scene | null = null;

    public get ctx() {
        return this.element.getContext('2d') as CanvasRenderingContext2D;
    }

    public static getInstance() {
        if (this._INSTANCE == null) {
            this._INSTANCE = new GameCanvas();
        }
        return this._INSTANCE;
    }

    private constructor() {
        this.element.style.backgroundColor = 'black';
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

        for (const key in window) {
            if (/^on/.test(key) && key !== 'onmousewheel' && key !== 'onwheel') {
                document.addEventListener(key.substring(2), ev => {
                    try {
                        ev.preventDefault();
                    } catch (e) {
                    }
                }, {passive: false});
            }
        }
        document.addEventListener('touchmove', e => {
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
    }

    public async onDraw(now: number, dt: number) {
        if (this.scene) {
            await this.scene.onDraw(now, dt);
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

    get game() {
        return GameCanvas.getInstance();
    }

    get ctx() {
        return this.game.ctx;
    }

    public async onSetup() {

    }

    public async onCleanup() {

    }

    public async onUpdate(now: number, dt: number) {

    }

    public async onFixedUpdate(now: number, dt: number) {

    }

    public async onDraw(now: number, dt: number) {
    }

    public get width() {
        return this.game.width;
    }

    public get height() {
        return this.game.height;
    }
}

export class GameObject {

    get game() {
        return GameCanvas.getInstance();
    }

    get scene() {
        return this.game.scene;
    }

    get ctx() {
        return this.game.ctx;
    }

    public async onDraw(now: number, dt: number) {

    }

    public async onUpdate(now: number, dt: number) {

    }

    public async onFixedUpdate(now: number, dt: number) {

    }

}