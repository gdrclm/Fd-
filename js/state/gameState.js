import { levels } from '../data/levels.js';

export const gameState = {
  currentLevel: 0,
  placedLayers: [],
  gameLocked: false,
  nextLayerId: 1,
  fxIntervalId: null,
  sceneBridge: null,
  stackAnalysis: {
    centerOfMassX: 0,
    supportEnvelope: { minX: 0, maxX: 0, width: 0 },
    averageInstability: 0,
    stabilityClass: 'stable',
    stabilityScore: 0
  },
  buildIssues: {
    issues: [],
    topIssue: null,
    issueCount: 0,
    averageSeverity: 0
  },
  lastScoring: null
};

export function getCurrentOrder() {
  return levels[gameState.currentLevel].recipe;
}

export function getCurrentLevelDefinition() {
  return levels[gameState.currentLevel];
}

export function resetPlacedLayers() {
  gameState.placedLayers.length = 0;
  gameState.nextLayerId = 1;
}

export function addPlacedLayer(layer) {
  const ingredientKey = layer.ingredientKey ?? layer.name;
  gameState.placedLayers.push({
    id: gameState.nextLayerId,
    ingredientKey,
    name: ingredientKey,
    ...layer
  });
  gameState.nextLayerId += 1;
}
