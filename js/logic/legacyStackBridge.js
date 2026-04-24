import {
  CELEBRATION_VIEWPORT_SIZE,
  LAYER_HEIGHT,
  LAYER_WIDTH
} from '../config/gameConfig.js';
import { ingredientSvgs } from '../data/ingredients.js';
import { getIngredientMaterialProfile } from '../data/materialRegistry.js';
import { gameState } from '../state/gameState.js';
import { clamp } from '../utils/math.js';

export function createLayer(name, interactive = false) {
  const layer = document.createElement('button');
  layer.type = 'button';
  layer.className = 'ingredient-layer';
  layer.innerHTML = ingredientSvgs[name] ?? ingredientSvgs['Нижняя булочка'];

  if (interactive) {
    layer.classList.add('ingredient-layer-clickable');
  }

  return layer;
}

export function getSafePlacement(stackEl, clientX, clientY) {
  const rect = stackEl.getBoundingClientRect();
  const x = clamp(clientX - rect.left - LAYER_WIDTH / 2, 0, Math.max(rect.width - LAYER_WIDTH, 0));
  const y = clamp(clientY - rect.top - LAYER_HEIGHT / 2, 0, Math.max(rect.height - LAYER_HEIGHT, 0));
  return { x, y };
}

export function getPlacedOrderByHeight(placedLayers) {
  return [...placedLayers]
    .sort((a, b) => b.y - a.y)
    .map((item) => item.ingredientKey ?? item.name);
}

export function getPlacedSnapshotForCelebration(placedLayers) {
  if (!placedLayers.length) return [];

  const bounds = placedLayers.reduce((acc, layer) => {
    acc.minX = Math.min(acc.minX, layer.x);
    acc.maxX = Math.max(acc.maxX, layer.x);
    acc.minY = Math.min(acc.minY, layer.y);
    acc.maxY = Math.max(acc.maxY, layer.y);
    return acc;
  }, {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });

  const contentWidth = Math.max(bounds.maxX - bounds.minX + LAYER_WIDTH, LAYER_WIDTH);
  const contentHeight = Math.max(bounds.maxY - bounds.minY + LAYER_HEIGHT, 120);
  const scale = Math.min(1, CELEBRATION_VIEWPORT_SIZE / contentWidth, CELEBRATION_VIEWPORT_SIZE / contentHeight);
  const offsetX = (CELEBRATION_VIEWPORT_SIZE - contentWidth * scale) / 2;
  const offsetY = (CELEBRATION_VIEWPORT_SIZE - contentHeight * scale) / 2;

  return [...placedLayers]
    .sort((a, b) => a.y - b.y)
    .map((layer) => ({
      name: layer.ingredientKey ?? layer.name,
      x: offsetX + (layer.x - bounds.minX) * scale,
      y: offsetY + (layer.y - bounds.minY) * scale
    }));
}

export function applyStackPhysics(stackEl, activeLayerId, renderStack) {
  const active = gameState.placedLayers.find((entry) => entry.id === activeLayerId);
  if (!active) return;

  const stackRect = stackEl.getBoundingClientRect();
  const activeIndex = gameState.placedLayers.findIndex((entry) => entry.id === activeLayerId);
  if (activeIndex < 0) return;

  gameState.placedLayers.forEach((layer, index) => {
    if (layer.id === activeLayerId) return;
    const relativeIndexDistance = Math.abs(index - activeIndex);
    const activeMaterial = getIngredientMaterialProfile(active.ingredientKey ?? active.name);
    const layerMaterial = getIngredientMaterialProfile(layer.ingredientKey ?? layer.name);
    const coupling = ((activeMaterial.adhesion + layerMaterial.adhesion) / 2) * (1 / (1 + relativeIndexDistance));
    const fluidity = (activeMaterial.plasticity + layerMaterial.plasticity) / 2;
    const massRatio = activeMaterial.density / (activeMaterial.density + layerMaterial.density);
    const targetX = active.x + (active.x - layer.x) * coupling * fluidity * massRatio * 0.2;
    const volumeLift = (activeMaterial.droop - layerMaterial.droop) * 26;
    const targetY = active.y + (index - activeIndex) * 26 - volumeLift;

    layer.x = clamp(layer.x + (targetX - layer.x) * 0.38, 0, Math.max(stackRect.width - LAYER_WIDTH, 0));
    layer.y = clamp(layer.y + (targetY - layer.y) * 0.27, 0, Math.max(stackRect.height - LAYER_HEIGHT, 0));
  });

  const orderedByY = [...gameState.placedLayers].sort((a, b) => a.y - b.y);
  gameState.placedLayers.splice(0, gameState.placedLayers.length, ...orderedByY);
  if (typeof renderStack === 'function') renderStack();
}

/**
 * Main stack renderer now delegates drawing and interaction to Pixi scene renderer.
 * DOM absolute layers are intentionally removed from main stack pipeline.
 */
export function renderStack({ stackEl, setStatus }) {
  const sceneBridge = gameState.sceneBridge;
  if (!sceneBridge || !sceneBridge.ready) return;

  sceneBridge.renderMainStack(gameState.placedLayers, {
    onLayerMove(layerId, x, y) {
      const targetLayer = gameState.placedLayers.find((entry) => entry.id === layerId);
      if (!targetLayer) return;
      targetLayer.x = x;
      targetLayer.y = y;
    },
    onLayerRemove(layerId) {
      const layerIndex = gameState.placedLayers.findIndex((entry) => entry.id === layerId);
      if (layerIndex < 0) return;
      const [removedLayer] = gameState.placedLayers.splice(layerIndex, 1);
      renderStack({ stackEl, setStatus });
      setStatus(`Слой «${removedLayer.ingredientKey ?? removedLayer.name}» удалён: ты вынес его за пределы бургера.`, 'bad');
    },
    onLayerDrop() {
      setStatus('Слой перемещён.');
      renderStack({ stackEl, setStatus });
    }
  });
}
