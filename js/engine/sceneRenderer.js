import { LAYER_HEIGHT, LAYER_WIDTH } from '../config/gameConfig.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isOutside(localPoint, width, height) {
  return localPoint.x < 0 || localPoint.x > width || localPoint.y < 0 || localPoint.y > height;
}

/**
 * Pixi renderer for main burger scene.
 * Отвечает только за display objects и визуальные контейнеры.
 */
export function createSceneRenderer({ PIXI, app, sceneRoot, mountEl, onResize }) {
  const backgroundLayer = new PIXI.Container();
  backgroundLayer.label = 'background-layer';
  const ingredientLayer = new PIXI.Container();
  ingredientLayer.label = 'ingredient-layer';
  const fxLayer = new PIXI.Container();
  fxLayer.label = 'fx-layer';
  const debugLayer = new PIXI.Container();
  debugLayer.label = 'debug-layer';
  debugLayer.visible = false;

  sceneRoot.addChild(backgroundLayer, ingredientLayer, fxLayer, debugLayer);

  const border = new PIXI.Graphics();
  backgroundLayer.addChild(border);
  const debugGraphics = new PIXI.Graphics();
  const debugSummaryText = new PIXI.Text('', {
    fontFamily: 'monospace',
    fontSize: 11,
    fill: 0x1f2937
  });
  debugSummaryText.x = 8;
  debugSummaryText.y = 8;
  debugLayer.addChild(debugGraphics, debugSummaryText);
  const debugEntityLabels = new Map();

  const interactionState = {
    handlers: null,
    activeDrag: null
  };

  function redrawBackground() {
    const width = app.renderer.width;
    const height = app.renderer.height;
    border.clear();
    border.lineStyle(2, 0xfdba74, 1);
    border.beginFill(0xffffff, 1);
    border.drawRoundedRect(0, 0, width, height, 12);
    border.endFill();
  }

  function updateSceneSize() {
    const width = mountEl.clientWidth || 420;
    const height = mountEl.clientHeight || 280;
    app.renderer.resize(width, height);
    redrawBackground();
    onResize?.({ width, height });
  }

  function bindEntityInteraction(entity) {
    const sprite = entity.pixiObject;
    if (sprite.__ingredientInteractionBound) return;

    sprite.eventMode = 'static';
    sprite.cursor = 'grab';

    sprite.on('pointerdown', (event) => {
      sprite.cursor = 'grabbing';
      sprite.alpha = 0.8;
      const local = ingredientLayer.toLocal(event.global);
      interactionState.activeDrag = {
        pointerId: event.pointerId,
        entityId: entity.id,
        offsetX: local.x - sprite.x,
        offsetY: local.y - sprite.y
      };

      interactionState.handlers?.onEntityGrab?.(entity);
    });

    sprite.on('pointermove', (event) => {
      const drag = interactionState.activeDrag;
      if (!drag || drag.pointerId !== event.pointerId || drag.entityId !== entity.id) return;
      if (!interactionState.handlers) return;

      const sceneWidth = app.renderer.width;
      const sceneHeight = app.renderer.height;
      const local = ingredientLayer.toLocal(event.global);
      const x = clamp(local.x - drag.offsetX, 0, Math.max(sceneWidth - LAYER_WIDTH, 0));
      const y = clamp(local.y - drag.offsetY, 0, Math.max(sceneHeight - LAYER_HEIGHT, 0));

      interactionState.handlers.onEntityMove(entity, x, y);

      const scenePoint = sceneRoot.toLocal(event.global);
      mountEl.classList.toggle('drop-active', isOutside(scenePoint, sceneWidth, sceneHeight));
    });

    const finishDrag = (event) => {
      const drag = interactionState.activeDrag;
      if (!drag || drag.pointerId !== event.pointerId || drag.entityId !== entity.id) return;
      if (!interactionState.handlers) return;

      interactionState.activeDrag = null;
      sprite.cursor = 'grab';
      sprite.alpha = 1;

      const sceneWidth = app.renderer.width;
      const sceneHeight = app.renderer.height;
      const scenePoint = sceneRoot.toLocal(event.global);
      const outside = isOutside(scenePoint, sceneWidth, sceneHeight);
      mountEl.classList.remove('drop-active');

      if (outside) {
        interactionState.handlers.onEntityRemove(entity);
        return;
      }

      interactionState.handlers.onEntityDrop(entity);
    };

    sprite.on('pointerup', finishDrag);
    sprite.on('pointerupoutside', finishDrag);
    sprite.on('pointercancel', finishDrag);
    sprite.__ingredientInteractionBound = true;
  }

  function renderEntities(entities, handlers) {
    interactionState.handlers = handlers;
    const activeIds = new Set();
    entities.forEach((entity) => activeIds.add(entity.id));
    for (let i = ingredientLayer.children.length - 1; i >= 0; i -= 1) {
      const child = ingredientLayer.children[i];
      if (!activeIds.has(child.__entityId)) ingredientLayer.removeChildAt(i);
    }

    entities.forEach((entity, index) => {
      const sprite = entity.pixiObject;
      sprite.__entityId = entity.id;

      if (sprite.parent !== ingredientLayer) {
        ingredientLayer.addChild(sprite);
      }
      bindEntityInteraction(entity);

      sprite.zIndex = 100 + index;
    });
    ingredientLayer.sortChildren();
  }


  function drawCheeseSheet(cheeseGraphic, entity, visualWidth, visualHeight) {
    const leftOverhang = Math.max(entity.leftOverhang ?? 0, 0);
    const rightOverhang = Math.max(entity.rightOverhang ?? 0, 0);
    const droop = Math.max(entity.droopAmount ?? 0, 0);
    const flattening = Math.max(entity.pressureFlattening ?? 0, 0);
    const adhesionBias = Math.max(entity.adhesionVisualBias ?? 0, 0);

    const bodyLeft = leftOverhang;
    const bodyRight = leftOverhang + entity.baseWidth;
    const topY = flattening * entity.baseHeight * 0.22;
    const bodyHeight = entity.baseHeight * (1 - flattening * 0.18);

    const leftDropY = bodyHeight + entity.baseHeight * droop * (0.85 + adhesionBias * 0.2);
    const rightDropY = bodyHeight + entity.baseHeight * droop * (0.85 + (1 - adhesionBias) * 0.2);
    const centerDropY = bodyHeight + entity.baseHeight * droop * (0.55 + adhesionBias * 0.1);

    cheeseGraphic.clear();
    cheeseGraphic.beginFill(0xf7c63d, 1);
    cheeseGraphic.lineStyle(1.5, 0xedb52d, 0.85);
    cheeseGraphic.moveTo(bodyLeft, topY);
    cheeseGraphic.quadraticCurveTo((bodyLeft + bodyRight) / 2, topY - 2, bodyRight, topY + 1);
    cheeseGraphic.lineTo(bodyRight + rightOverhang * 0.45, rightDropY);
    cheeseGraphic.quadraticCurveTo(bodyLeft + entity.baseWidth * 0.5, centerDropY, bodyLeft - leftOverhang * 0.45, leftDropY);
    cheeseGraphic.closePath();
    cheeseGraphic.endFill();

    cheeseGraphic.beginFill(0xf9d766, 0.45);
    cheeseGraphic.drawRoundedRect(bodyLeft + 6, topY + 3, Math.max(entity.baseWidth - 12, 8), Math.max(bodyHeight * 0.22, 4), 5);
    cheeseGraphic.endFill();
  }


  function drawSauceSmear(sauceGraphic, entity) {
    const smearWidth = Math.max(entity.smearWidth ?? entity.baseWidth, entity.baseWidth);
    const smearThickness = Math.max(entity.smearThickness ?? entity.baseHeight * 0.24, entity.baseHeight * 0.08);
    const overflowLeft = Math.max(entity.overflowLeft ?? 0, 0);
    const overflowRight = Math.max(entity.overflowRight ?? 0, 0);
    const spread = Math.max(entity.spreadAmount ?? 0, 0);

    const left = overflowLeft;
    const right = overflowLeft + smearWidth;
    const centerX = (left + right) / 2;
    const baseY = entity.baseHeight * 0.5;
    const waveDepth = smearThickness * (0.32 + spread * 0.36);

    sauceGraphic.clear();
    sauceGraphic.beginFill(0xf39a30, 0.95);
    sauceGraphic.lineStyle(1.2, 0xe47f1f, 0.75);
    sauceGraphic.moveTo(left, baseY);
    sauceGraphic.quadraticCurveTo(centerX, baseY - smearThickness * 0.22, right, baseY);
    sauceGraphic.quadraticCurveTo(right - overflowRight * 0.55, baseY + waveDepth, centerX, baseY + smearThickness);
    sauceGraphic.quadraticCurveTo(left + overflowLeft * 0.55, baseY + waveDepth, left, baseY);
    sauceGraphic.closePath();
    sauceGraphic.endFill();

    sauceGraphic.beginFill(0xf8b354, 0.42);
    sauceGraphic.drawRoundedRect(left + smearWidth * 0.08, baseY + smearThickness * 0.18, smearWidth * 0.84, smearThickness * 0.2, 4);
    sauceGraphic.endFill();
  }

  function syncEntityViews(entities) {
    entities.forEach((entity) => {
      const sprite = entity.pixiObject;

      if (entity.materialType === 'bun') {
        const compression = Math.min(Math.max(entity.currentCompression ?? 0, 0), 0.45);
        const widthExpansion = Math.min(Math.max(entity.widthExpansion ?? 0, 0), 0.2);

        const visualWidth = entity.baseWidth * (1 + widthExpansion);
        const visualHeight = entity.baseHeight * (1 - compression);

        sprite.width = visualWidth;
        sprite.height = visualHeight;
        sprite.x = entity.x - (visualWidth - entity.baseWidth) / 2;
        sprite.y = entity.y + (entity.baseHeight - visualHeight);
      } else if (entity.materialType === 'cheese' && sprite.__isCheeseVisual) {
        const leftOverhang = Math.max(entity.leftOverhang ?? 0, 0);
        const rightOverhang = Math.max(entity.rightOverhang ?? 0, 0);
        const overhangWidth = leftOverhang + rightOverhang;
        const droopPx = entity.baseHeight * Math.max(entity.droopAmount ?? 0, 0);

        const visualWidth = entity.baseWidth + overhangWidth;
        const visualHeight = entity.baseHeight + droopPx;

        drawCheeseSheet(sprite.__cheeseSheet, entity, visualWidth, visualHeight);
        sprite.hitArea = new PIXI.Rectangle(0, 0, visualWidth, visualHeight);
        sprite.x = entity.x - leftOverhang;
        sprite.y = entity.y;
      } else if (entity.materialType === 'sauce' && sprite.__isSauceVisual) {
        const overflowLeft = Math.max(entity.overflowLeft ?? 0, 0);
        const overflowRight = Math.max(entity.overflowRight ?? 0, 0);
        const visualWidth = Math.max(entity.smearWidth ?? entity.baseWidth, entity.baseWidth);
        const visualHeight = Math.max(entity.baseHeight, (entity.baseHeight * 0.5) + (entity.smearThickness ?? entity.baseHeight * 0.24));

        drawSauceSmear(sprite.__sauceSmear, entity);
        sprite.hitArea = new PIXI.Rectangle(0, 0, visualWidth + overflowLeft + overflowRight, visualHeight + entity.baseHeight * 0.3);
        sprite.x = entity.x - overflowLeft;
        sprite.y = entity.y;
      } else if (entity.materialType === 'produce') {
        const wobbleAmount = Math.min(Math.max(entity.wobbleAmount ?? 0, 0), 1);
        const wobblePhase = entity.wobblePhase ?? 0;
        const wobbleX = Math.sin(wobblePhase) * entity.baseWidth * 0.018 * wobbleAmount;
        const wobbleY = Math.sin(wobblePhase * 0.7) * entity.baseHeight * 0.04 * wobbleAmount;
        const wobbleTilt = Math.sin(wobblePhase * 1.6) * 0.03 * wobbleAmount;

        sprite.width = entity.baseWidth;
        sprite.height = entity.baseHeight;
        sprite.x = entity.x + wobbleX;
        sprite.y = entity.y + wobbleY;
        sprite.rotation = (entity.tilt ?? 0) + wobbleTilt;
        return;
      } else {
        sprite.width = entity.baseWidth;
        sprite.height = entity.baseHeight;
        sprite.x = entity.x;
        sprite.y = entity.y;
      }

      sprite.rotation = entity.tilt ?? 0;
    });
  }

  updateSceneSize();
  ingredientLayer.sortableChildren = true;
  globalThis.addEventListener('resize', updateSceneSize);

  function ensureDebugLabel(entityId) {
    let label = debugEntityLabels.get(entityId);
    if (label) return label;
    label = new PIXI.Text('', {
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0x334155
    });
    debugEntityLabels.set(entityId, label);
    debugLayer.addChild(label);
    return label;
  }

  function renderDebugOverlay({
    enabled,
    entities = [],
    stackAnalysis = null,
    buildIssues = null,
    scoring = null
  }) {
    debugLayer.visible = Boolean(enabled);
    if (!enabled) return;

    debugGraphics.clear();
    const active = new Set(entities.map((entity) => entity.id));
    [...debugEntityLabels.keys()].forEach((entityId) => {
      if (active.has(entityId)) return;
      const label = debugEntityLabels.get(entityId);
      label?.destroy();
      debugEntityLabels.delete(entityId);
    });

    entities.forEach((entity) => {
      const bounds = entity.physicsBody.bounds;
      debugGraphics.lineStyle(1, 0x6366f1, 0.75);
      debugGraphics.drawRect(
        bounds.min.x,
        bounds.min.y,
        bounds.max.x - bounds.min.x,
        bounds.max.y - bounds.min.y
      );
      debugGraphics.beginFill(0x0ea5e9, 0.8);
      debugGraphics.drawCircle(entity.physicsBody.position.x, entity.physicsBody.position.y, 2);
      debugGraphics.endFill();

      const label = ensureDebugLabel(entity.id);
      label.x = entity.x;
      label.y = entity.y - 24;
      label.text = `#${entity.id} sup:${(entity.supportRatio ?? 0).toFixed(2)} p:${(entity.incomingPressure ?? 0).toFixed(2)} l:${(entity.totalLoadAbove ?? 0).toFixed(2)}`;
    });

    const scoreLine = scoring?.subscores
      ? `score r:${Math.round(scoring.subscores.recipeScore * 100)} a:${Math.round(scoring.subscores.alignmentScore * 100)} s:${Math.round(scoring.subscores.stabilityScore * 100)} m:${Math.round(scoring.subscores.materialScore * 100)}`
      : 'score n/a';
    debugSummaryText.text = [
      `stability: ${stackAnalysis?.stabilityClass ?? 'n/a'} (${(stackAnalysis?.stabilityScore ?? 0).toFixed(2)})`,
      `issues: ${(buildIssues?.issues ?? []).slice(0, 2).map((issue) => issue.id).join(', ') || 'none'}`,
      scoreLine
    ].join('\n');
  }

  return {
    layers: { backgroundLayer, ingredientLayer, fxLayer, debugLayer },
    renderEntities,
    syncEntityViews,
    renderDebugOverlay,
    resize: updateSceneSize,
    destroy() {
      globalThis.removeEventListener('resize', updateSceneSize);
      ingredientLayer.children.forEach((child) => {
        child.removeAllListeners();
      });
      ingredientLayer.removeChildren();
    }
  };
}
