import { createSceneApp } from './sceneApp.js';
import { createPhysicsWorld } from './physicsWorld.js';
import { createSceneRenderer } from './sceneRenderer.js';
import { createIngredientEntity } from './entities/ingredientEntityFactory.js';
import { syncEntitiesFromPhysics } from './entities/entitySync.js';
import { createSceneRuntime } from './sceneRuntime.js';
import { analyzeSupportMetrics } from './analysis/supportAnalyzer.js';
import { analyzeLoadAndPressure } from './analysis/loadPressureAnalyzer.js';
import { analyzeBuildIssues } from './analysis/buildIssuesAnalyzer.js';
import { DROP_INITIAL_VELOCITY_Y } from './sceneConstants.js';
import { DEV_FLAGS } from '../config/gameConfig.js';

/**
 * Scene bridge объединяет orchestration-уровень:
 * - physicsState: состояние Matter
 * - renderState: состояние Pixi
 * - uiState: внешний DOM/UI статус
 */
export function initSceneBridge({
  sceneRootEl,
  onStackAnalysis,
  onBuildIssues,
  getDebugScoring
}) {
  if (!sceneRootEl) {
    return { ready: false, reason: 'scene-root element is missing' };
  }

  let renderState;
  let physicsState;
  try {
    renderState = createSceneApp(sceneRootEl);
    physicsState = createPhysicsWorld();
  } catch (error) {
    return { ready: false, reason: error instanceof Error ? error.message : String(error) };
  }

  const renderer = createSceneRenderer({
    PIXI: renderState.PIXI,
    app: renderState.app,
    sceneRoot: renderState.sceneRoot,
    mountEl: sceneRootEl,
    onResize: ({ width, height }) => {
      physicsState.setWorldBounds(width, height);
    }
  });
  physicsState.setWorldBounds(renderState.app.renderer.width, renderState.app.renderer.height);

  const uiState = {
    mode: 'legacy-gameplay',
    notes: 'Tray и внешние контролы пока работают через legacy DOM-слой.'
  };

  const entityById = new Map();
  const textureCache = new Map();
  let currentLayers = [];
  let currentHandlers = {
    onLayerMove: () => {},
    onLayerRemove: () => {},
    onLayerDrop: () => {}
  };

  let stackAnalysis = {
    centerOfMassX: 0,
    supportEnvelope: { minX: 0, maxX: 0, width: 0 },
    averageInstability: 0,
    stabilityClass: 'stable',
    stabilityScore: 0
  };

  let buildIssuesState = {
    issues: [],
    topIssue: null,
    issueCount: 0,
    averageSeverity: 0
  };
  let entityArrayCache = [];
  let entityArrayDirty = true;
  let analysisAccumulatorMs = 0;

  const urlDebugEnabled = typeof globalThis?.location?.search === 'string'
    && new URLSearchParams(globalThis.location.search).get('debug') === '1';
  const debugEnabled = DEV_FLAGS.debugOverlay || urlDebugEnabled;

  function getEntitiesCached() {
    if (!entityArrayDirty) return entityArrayCache;
    entityArrayCache = [...entityById.values()];
    entityArrayDirty = false;
    return entityArrayCache;
  }

  function createOrUpdateEntities(layers) {
    const activeIds = new Set(layers.map((item) => item.id));

    [...entityById.keys()].forEach((id) => {
      if (activeIds.has(id)) return;
      const entity = entityById.get(id);
      if (entity) {
        physicsState.Matter.World.remove(physicsState.world, entity.physicsBody);
      }
      entityById.delete(id);
      entityArrayDirty = true;
    });

    layers.forEach((item) => {
      let entity = entityById.get(item.id);
      if (!entity) {
        entity = createIngredientEntity({
          id: item.id,
          ingredientKey: item.ingredientKey ?? item.name,
          x: item.x,
          y: item.y,
          Matter: physicsState.Matter,
          world: physicsState.world,
          PIXI: renderState.PIXI,
          textureCache
        });
        entityById.set(item.id, entity);
        entityArrayDirty = true;
      }
    });

    return layers.map((item) => entityById.get(item.id)).filter(Boolean);
  }

  function updateEntityFromSceneInput(entity, x, y) {
    entity.x = x;
    entity.y = y;
    entity.state = 'grabbed';
    entity.isSettling = false;
    entity.restFrames = 0;

    physicsState.Matter.Body.setStatic(entity.physicsBody, true);
    physicsState.Matter.Body.setVelocity(entity.physicsBody, { x: 0, y: 0 });
    physicsState.Matter.Body.setAngularVelocity(entity.physicsBody, 0);
    physicsState.Matter.Body.setAngle(entity.physicsBody, 0);
    physicsState.Matter.Body.setPosition(entity.physicsBody, {
      x: x + entity.width / 2,
      y: y + entity.height / 2
    });
  }

  function dropGrabbedEntity(entity) {
    entity.state = 'dropping';
    entity.isSettling = false;
    entity.restFrames = 0;

    physicsState.Matter.Body.setStatic(entity.physicsBody, false);
    physicsState.Matter.Body.setVelocity(entity.physicsBody, { x: 0, y: DROP_INITIAL_VELOCITY_Y * 0.6 });
    physicsState.Matter.Body.setAngularVelocity(entity.physicsBody, 0);
  }

  function syncEntitiesToLayers() {
    currentLayers.forEach((layer) => {
      const entity = entityById.get(layer.id);
      if (!entity) return;
      layer.x = entity.x;
      layer.y = entity.y;
      layer.ingredientKey = entity.ingredientKey;
      layer.name = entity.ingredientKey;
    });
  }

  function reconcileScene() {
    const entities = createOrUpdateEntities(currentLayers);
    renderer.renderEntities(entities, {
      onEntityGrab(entity) {
        entity.state = 'grabbed';
      },
      onEntityMove(entity, x, y) {
        updateEntityFromSceneInput(entity, x, y);
        currentHandlers.onLayerMove(entity.id, x, y);
      },
      onEntityRemove(entity) {
        currentHandlers.onLayerRemove(entity.id);
      },
      onEntityDrop(entity) {
        dropGrabbedEntity(entity);
        currentHandlers.onLayerDrop(entity.id);
      }
    });
    return entities;
  }

  const runtime = createSceneRuntime({
    app: renderState.app,
    Matter: physicsState.Matter,
    engine: physicsState.engine,
    renderer,
    getEntities: getEntitiesCached,
    onAfterPhysicsStep: (stepMs) => {
      analysisAccumulatorMs += stepMs;
      // future hook: material reactions and settling probes
    },
    onAfterPhysics: (entities) => {
      if (analysisAccumulatorMs >= 33) {
        analyzeSupportMetrics({ entities, engine: physicsState.engine });
        stackAnalysis = analyzeLoadAndPressure({ entities });
        onStackAnalysis?.(stackAnalysis);
        buildIssuesState = analyzeBuildIssues({ entities, stackAnalysis });
        onBuildIssues?.(buildIssuesState);
        analysisAccumulatorMs = 0;
      }
      syncEntitiesFromPhysics(entities, physicsState.Matter);
      syncEntitiesToLayers();
      // future hook: scoring probes
    },
    onBeforeRender: (entities) => {
      renderer.renderDebugOverlay({
        enabled: debugEnabled,
        entities,
        stackAnalysis,
        buildIssues: buildIssuesState,
        scoring: getDebugScoring?.() ?? null
      });
    }
  });

  runtime.start();

  return {
    ready: true,
    physicsState,
    renderState,
    renderer,
    runtime,
    uiState,
    getStackAnalysis() {
      return stackAnalysis;
    },
    getBuildIssues() {
      return buildIssuesState;
    },
    getEntitiesSnapshot() {
      return [...entityById.values()];
    },
    renderMainStack(placedLayers, handlers) {
      currentLayers = placedLayers;
      currentHandlers = handlers;
      reconcileScene();
    },
    pause() {
      runtime.pause();
    },
    resume() {
      runtime.resume();
    },
    destroy() {
      runtime.stop();
      [...entityById.values()].forEach((entity) => {
        physicsState.Matter.World.remove(physicsState.world, entity.physicsBody);
      });
      entityById.clear();
      renderer.destroy();
      renderState.app.destroy(true, { children: true, texture: false, baseTexture: false });
    }
  };
}
