import { ROUND_TIME_SECONDS, SCORING_V2_CONFIG } from '../config/gameConfig.js';
import { getPlacedOrderByHeight } from './legacyStackBridge.js';

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function toCountMap(items) {
  return items.reduce((acc, key) => {
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map());
}

function calculateRecipeScore(placedLayers, expectedOrder) {
  const placedOrder = getPlacedOrderByHeight(placedLayers);
  const maxLength = Math.max(placedOrder.length, expectedOrder.length, 1);

  let exactMatches = 0;
  for (let i = 0; i < Math.min(placedOrder.length, expectedOrder.length); i += 1) {
    if (placedOrder[i] === expectedOrder[i]) exactMatches += 1;
  }
  const exactOrderRatio = exactMatches / maxLength;

  const placedCount = toCountMap(placedOrder);
  const expectedCount = toCountMap(expectedOrder);
  const uniqueIngredients = new Set([...placedCount.keys(), ...expectedCount.keys()]);
  let matchedIngredients = 0;
  uniqueIngredients.forEach((ingredient) => {
    matchedIngredients += Math.min(placedCount.get(ingredient) ?? 0, expectedCount.get(ingredient) ?? 0);
  });
  const ingredientSetRatio = matchedIngredients / maxLength;

  const lengthGap = Math.abs(placedOrder.length - expectedOrder.length);
  const lengthPenalty = clamp(1 - lengthGap * SCORING_V2_CONFIG.recipe.lengthPenaltyPerLayer, 0, 1);

  const { exactOrderWeight, ingredientSetWeight } = SCORING_V2_CONFIG.recipe;
  return clamp(
    (exactOrderRatio * exactOrderWeight + ingredientSetRatio * ingredientSetWeight) * lengthPenalty,
    0,
    1
  );
}

function calculateAlignmentScore(entities) {
  const active = entities.filter((entity) => entity.state === 'settling' || entity.state === 'resting');
  if (!active.length) return 0;

  const score = active.reduce((acc, entity) => {
    const centering = clamp(1 - Math.abs(entity.lateralOffset ?? 0), 0, 1);
    const support = clamp(entity.supportRatio ?? 0, 0, 1);
    const contact = clamp(entity.contactQuality ?? 0, 0, 1);
    return acc + centering * 0.55 + support * 0.35 + contact * 0.1;
  }, 0) / active.length;

  return clamp(score, 0, 1);
}

function calculateStabilityScore(stackAnalysis) {
  const classPenalty = stackAnalysis?.stabilityClass === 'unstable'
    ? 0.35
    : stackAnalysis?.stabilityClass === 'risky'
      ? 0.18
      : 0;
  const risk = clamp((stackAnalysis?.stabilityScore ?? 1) + classPenalty, 0, 1);
  return clamp(1 - risk, 0, 1);
}

function calculateMaterialScore(entities, buildIssues) {
  const active = entities.filter((entity) => entity.state === 'settling' || entity.state === 'resting');
  if (!active.length) return 0;

  const baseScore = active.reduce((acc, entity) => {
    if (entity.materialType === 'bun') {
      return acc + clamp(1 - (entity.currentCompression ?? 0) * 1.9, 0, 1);
    }
    if (entity.materialType === 'cheese') {
      const overhang = (entity.leftOverhang ?? 0) + (entity.rightOverhang ?? 0);
      const coverageRatio = clamp((entity.baseWidth + overhang) / Math.max(entity.baseWidth, 1), 0, 1.35);
      const flattenPenalty = clamp(entity.pressureFlattening ?? 0, 0, 1) * 0.35;
      return acc + clamp((coverageRatio / 1.08) - flattenPenalty, 0, 1);
    }
    if (entity.materialType === 'produce') {
      const drift = Math.abs(entity.lateralDriftTarget ?? 0) / Math.max(entity.baseWidth * 0.2, 1);
      return acc + clamp(1 - drift - (entity.localInstability ?? 0) * 0.45, 0, 1);
    }
    if (entity.materialType === 'sauce') {
      const overflowRatio = ((entity.overflowLeft ?? 0) + (entity.overflowRight ?? 0)) / Math.max(entity.baseWidth, 1);
      return acc + clamp(1 - overflowRatio * 1.75 - (entity.spreadAmount ?? 0) * 0.35, 0, 1);
    }
    return acc + clamp(1 - (entity.localInstability ?? 0) * 0.5, 0, 1);
  }, 0) / active.length;

  const issuePenalty = clamp(
    (buildIssues?.issues ?? [])
      .filter((issue) => ['over-compressed-bun', 'poor-cheese-coverage', 'produce-slippage', 'sauce-overflow']
        .includes(issue.id))
      .reduce((sum, issue) => sum + issue.severity, 0) * 0.12,
    0,
    0.55
  );

  return clamp(baseScore - issuePenalty, 0, 1);
}

function calculatePresentationScore(buildIssues) {
  const issueCount = buildIssues?.issueCount ?? 0;
  const severity = buildIssues?.averageSeverity ?? 0;
  return clamp(1 - issueCount * 0.09 - severity * 0.6, 0, 1);
}

function getEffectiveWeights(baseWeights, emphasis = {}) {
  const scaled = Object.fromEntries(
    Object.entries(baseWeights).map(([key, value]) => [key, value * (emphasis[key] ?? 1)])
  );
  const total = Object.values(scaled).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return baseWeights;

  return Object.fromEntries(
    Object.entries(scaled).map(([key, value]) => [key, value / total])
  );
}

/**
 * Scoring v2: deterministic breakdown based on recipe + physical stack quality.
 * Every subscore is normalized to [0..1], then aggregated by configurable weights.
 */
export function calculateScoringV2({
  placedLayers,
  expectedOrder,
  entities,
  stackAnalysis,
  buildIssues,
  timeLeftSeconds,
  roundTimeSeconds = ROUND_TIME_SECONDS,
  scoringEmphasis = {}
}) {
  const recipeScore = calculateRecipeScore(placedLayers, expectedOrder);
  const alignmentScore = calculateAlignmentScore(entities);
  const stabilityScore = calculateStabilityScore(stackAnalysis);
  const materialScore = calculateMaterialScore(entities, buildIssues);
  const presentationScore = calculatePresentationScore(buildIssues);
  const timeScore = clamp((timeLeftSeconds ?? 0) / Math.max(roundTimeSeconds, 1), 0, 1);

  const weights = getEffectiveWeights(SCORING_V2_CONFIG.weights, scoringEmphasis);
  const weighted = {
    recipeScore: recipeScore * weights.recipeScore,
    alignmentScore: alignmentScore * weights.alignmentScore,
    stabilityScore: stabilityScore * weights.stabilityScore,
    materialScore: materialScore * weights.materialScore,
    presentationScore: presentationScore * weights.presentationScore,
    timeScore: timeScore * weights.timeScore
  };

  const totalScoreNormalized = clamp(Object.values(weighted).reduce((sum, part) => sum + part, 0), 0, 1);
  const totalScore100 = Math.round(totalScoreNormalized * 100);
  const pass = recipeScore >= SCORING_V2_CONFIG.recipePassThreshold
    && totalScoreNormalized >= SCORING_V2_CONFIG.totalPassThreshold;

  return {
    pass,
    totalScoreNormalized,
    totalScore100,
    subscores: {
      recipeScore,
      alignmentScore,
      stabilityScore,
      materialScore,
      presentationScore,
      timeScore
    },
    weighted,
    thresholds: {
      recipePassThreshold: SCORING_V2_CONFIG.recipePassThreshold,
      totalPassThreshold: SCORING_V2_CONFIG.totalPassThreshold
    }
  };
}

export function formatScoringBreakdown(scoring) {
  const pct = (value) => `${Math.round(clamp(value, 0, 1) * 100)}%`;
  return [
    `Итог: ${scoring.totalScore100}/100`,
    `Рецепт: ${pct(scoring.subscores.recipeScore)}`,
    `Выравнивание: ${pct(scoring.subscores.alignmentScore)}`,
    `Устойчивость: ${pct(scoring.subscores.stabilityScore)}`,
    `Материалы: ${pct(scoring.subscores.materialScore)}`,
    `Подача: ${pct(scoring.subscores.presentationScore)}`,
    `Время: ${pct(scoring.subscores.timeScore)}`
  ];
}

export function getScoreGrade(totalScore100) {
  if (totalScore100 >= 93) return { grade: 'S', label: 'Мастер бургеров' };
  if (totalScore100 >= 85) return { grade: 'A', label: 'Отличная сборка' };
  if (totalScore100 >= 75) return { grade: 'B', label: 'Хорошая сборка' };
  if (totalScore100 >= 64) return { grade: 'C', label: 'Нормально, но можно лучше' };
  if (totalScore100 >= 52) return { grade: 'D', label: 'Нестабильная сборка' };
  return { grade: 'E', label: 'Сборка требует доработки' };
}
