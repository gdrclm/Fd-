import { SCENE_BACKGROUND_COLOR, SCENE_HEIGHT, SCENE_WIDTH } from './sceneConstants.js';

/**
 * PixiJS отвечает только за render/draw/view containers/effects.
 * Никакой физики, столкновений или world-логики здесь быть не должно.
 */
export function createSceneApp(sceneRootEl) {
  const PIXI = globalThis.PIXI;
  if (!PIXI) {
    throw new Error('PixiJS is not loaded. Expected global PIXI from CDN script.');
  }

  const initialWidth = sceneRootEl.clientWidth || SCENE_WIDTH;
  const initialHeight = sceneRootEl.clientHeight || SCENE_HEIGHT;

  const app = new PIXI.Application({
    width: initialWidth,
    height: initialHeight,
    antialias: true,
    backgroundColor: SCENE_BACKGROUND_COLOR,
    resolution: Math.max(globalThis.devicePixelRatio || 1, 1),
    autoDensity: true,
    autoStart: false,
    sharedTicker: false
  });
  app.ticker.stop();

  sceneRootEl.replaceChildren(app.view);

  const sceneRoot = new PIXI.Container();
  sceneRoot.label = 'burger-scene-root';
  app.stage.addChild(sceneRoot);

  return { app, sceneRoot, PIXI };
}
