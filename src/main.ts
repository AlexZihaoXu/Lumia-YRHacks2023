import {GameCanvas} from './engine';
import {MenuScene} from './menu';
import {LevelScene} from './content';

const game = GameCanvas.getInstance();
game.addToBodyAndRegisterEvents();
// @ts-ignored
window.game = game;

game.scene = new MenuScene();

game.start();