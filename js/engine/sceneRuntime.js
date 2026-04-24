import { PHYSICS_STEP_MS } from './sceneConstants.js';

const MAX_DELTA_MS = 1000 / 15;
const MAX_SUB_STEPS = 4;

/**
 * Centralized scene runtime loop:
 * 1) step physics
 * 2) update game/entity state
 * 3) sync render objects
 * 4) render frame
 */
export function createSceneRuntime({
  app,
  Matter,
  engine,
  renderer,
  getEntities,
  onAfterPhysicsStep,
  onAfterPhysics,
  onBeforeRender,
  onAfterRender
}) {
  let frameId = null;
  let lastTime = 0;
  let accumulator = 0;
  let paused = false;

  function frame(now) {
    if (paused) return;

    if (!lastTime) lastTime = now;
    const rawDelta = now - lastTime;
    lastTime = now;

    const delta = Math.min(Math.max(rawDelta, 0), MAX_DELTA_MS);
    accumulator += delta;

    let subSteps = 0;
    while (accumulator >= PHYSICS_STEP_MS && subSteps < MAX_SUB_STEPS) {
      Matter.Engine.update(engine, PHYSICS_STEP_MS);
      onAfterPhysicsStep?.(PHYSICS_STEP_MS);
      accumulator -= PHYSICS_STEP_MS;
      subSteps += 1;
    }

    const entities = getEntities();
    onAfterPhysics?.(entities, delta);
    renderer.syncEntityViews(entities);

    onBeforeRender?.(entities, delta);
    app.render();
    onAfterRender?.(entities, delta);

    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (frameId !== null) return;
    paused = false;
    lastTime = 0;
    accumulator = 0;
    frameId = requestAnimationFrame(frame);
  }

  function pause() {
    paused = true;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function resume() {
    if (!paused) return;
    paused = false;
    lastTime = 0;
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    pause();
    accumulator = 0;
  }

  return {
    start,
    pause,
    resume,
    stop,
    isPaused: () => paused
  };
}
