function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isEligibleForLoad(entity) {
  return entity.state === 'settling' || entity.state === 'resting';
}

function getEntityMass(entity) {
  return Math.max(entity.physicsBody?.mass ?? entity.material.density * entity.width * entity.height, 0.001);
}

function computeSupportEnvelope(entities) {
  const grounded = entities.filter((entity) => entity.supportKind === 'ground' && isEligibleForLoad(entity));
  const source = grounded.length ? grounded : entities.slice(-2);
  if (!source.length) {
    return { minX: 0, maxX: 0, width: 0 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;

  source.forEach((entity) => {
    const supportWidth = Math.max(entity.supportWidth || entity.width * 0.35, entity.width * 0.2);
    const centerX = entity.x + entity.width / 2;
    minX = Math.min(minX, centerX - supportWidth / 2);
    maxX = Math.max(maxX, centerX + supportWidth / 2);
  });

  return {
    minX,
    maxX,
    width: Math.max(maxX - minX, 0)
  };
}

function classifyStability({ centerOfMassX, supportEnvelope, averageInstability }) {
  const { minX, maxX, width } = supportEnvelope;
  const normalizedOutside = width <= 0
    ? 1
    : centerOfMassX < minX
      ? (minX - centerOfMassX) / width
      : centerOfMassX > maxX
        ? (centerOfMassX - maxX) / width
        : 0;

  const stackRisk = clamp(averageInstability * 0.75 + normalizedOutside * 0.95, 0, 1);
  if (stackRisk < 0.33) return { label: 'stable', score: stackRisk };
  if (stackRisk < 0.66) return { label: 'risky', score: stackRisk };
  return { label: 'unstable', score: stackRisk };
}

/**
 * Deterministic gameplay load/pressure model built on top of support metrics.
 * This is intentionally a simple game approximation, not raw force integration.
 */
export function analyzeLoadAndPressure({ entities }) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const ordered = [...entities].sort((a, b) => a.y - b.y);

  ordered.forEach((entity) => {
    entity.totalLoadAbove = 0;
    entity.incomingPressure = 0;
    entity.compressionTarget = 0;
    entity.localInstability = 0;
  });

  for (let i = 0; i < ordered.length; i += 1) {
    const entity = ordered[i];
    if (!isEligibleForLoad(entity)) continue;

    const supporterId = entity.supportingEntityId;
    const supporter = typeof supporterId === 'number' ? byId.get(supporterId) : null;
    if (!supporter || !isEligibleForLoad(supporter)) continue;

    const transferredLoad = (getEntityMass(entity) + entity.totalLoadAbove)
      * clamp(entity.supportRatio * (0.35 + entity.contactQuality * 0.65), 0.2, 1);

    supporter.totalLoadAbove += transferredLoad;
  }

  ordered.forEach((entity) => {
    const mass = getEntityMass(entity);
    const supportFactor = clamp(entity.supportRatio || 0, 0.15, 1);
    const materialFactor = clamp(1 - entity.material.compressionResistance * 0.55, 0.2, 1);

    entity.incomingPressure = isEligibleForLoad(entity)
      ? (entity.totalLoadAbove / mass) * (1 / supportFactor)
      : 0;
    entity.compressionTarget = clamp(entity.incomingPressure * materialFactor * 0.4, 0, 1);

    const supportInstability = (1 - supportFactor) * 0.45;
    const offsetInstability = Math.abs(entity.lateralOffset || 0) * 0.3;
    const contactInstability = (1 - (entity.contactQuality || 0)) * 0.2;
    const transitionInstability = entity.state === 'settling' ? 0.12 : 0;
    entity.localInstability = clamp(
      supportInstability + offsetInstability + contactInstability + transitionInstability,
      0,
      1
    );

    if (entity.materialType === 'produce') {
      const supportForgiveness = entity.material.supportForgiveness ?? 0.35;
      const driftSensitivity = entity.material.driftSensitivity ?? 0.6;
      const offCenterBias = Math.abs(entity.lateralOffset || 0) * (1.15 - supportForgiveness);
      const pressureBias = clamp(entity.incomingPressure * 0.12, 0, 0.35);
      const driftSignal = clamp((offCenterBias + entity.localInstability * 0.45 + pressureBias) * driftSensitivity, 0, 1);
      const driftDirection = Math.sign(entity.lateralOffset || 0);
      entity.lateralDriftTarget = driftDirection * entity.baseWidth * 0.16 * driftSignal;
      entity.settleDamping = entity.material.settleDamping ?? 0.42;
    } else {
      entity.lateralDriftTarget = 0;
      entity.settleDamping = entity.material.settleDamping ?? 0.75;
    }

    if (entity.materialType === 'sauce') {
      const supportPenalty = 1 - supportFactor;
      const pressureBias = clamp(entity.incomingPressure * 0.22 + entity.totalLoadAbove * 0.03, 0, 0.85);
      entity.spreadAmount = clamp(pressureBias * 0.65 + supportPenalty * 0.35, 0, 1);
      entity.slipperinessModifier = clamp(entity.material.smearFactor * 0.45 + entity.spreadAmount * 0.55, 0, 1);
    }
  });


  const sauceLayers = ordered.filter((entity) => entity.materialType === 'sauce' && entity.spreadAmount > 0.02);
  if (sauceLayers.length) {
    ordered.forEach((entity) => {
      if (entity.materialType !== 'produce') return;

      let sauceInfluence = 0;
      sauceLayers.forEach((sauce) => {
        const sauceHalfWidth = (sauce.baseWidth * (1 + sauce.spreadAmount * 0.35)) / 2;
        const sauceCenterX = sauce.x + sauce.baseWidth / 2;
        const produceCenterX = entity.x + entity.baseWidth / 2;
        const horizontalOverlap = clamp(
          1 - Math.abs(produceCenterX - sauceCenterX) / Math.max(sauceHalfWidth + entity.baseWidth / 2, 1),
          0,
          1
        );

        const verticalGap = Math.abs((entity.y + entity.baseHeight / 2) - (sauce.y + sauce.baseHeight / 2));
        const verticalFactor = clamp(1 - verticalGap / (entity.baseHeight * 1.4), 0, 1);
        sauceInfluence = Math.max(
          sauceInfluence,
          horizontalOverlap * verticalFactor * (sauce.slipperinessModifier ?? 0)
        );
      });

      if (sauceInfluence <= 0) return;

      const influenceSign = Math.sign(entity.lateralOffset || (entity.supportingEntityId === 'ground' ? 0 : 1));
      entity.lateralDriftTarget += influenceSign * entity.baseWidth * 0.045 * sauceInfluence;
      entity.localInstability = clamp(entity.localInstability + sauceInfluence * 0.22, 0, 1);
      entity.settleDamping = clamp(entity.settleDamping - sauceInfluence * 0.12, 0.22, 0.95);
    });
  }

  const weightedMassSum = ordered.reduce((acc, entity) => acc + getEntityMass(entity), 0);
  const centerOfMassX = weightedMassSum > 0
    ? ordered.reduce((acc, entity) => acc + (entity.x + entity.width / 2) * getEntityMass(entity), 0) / weightedMassSum
    : 0;

  const supportEnvelope = computeSupportEnvelope(ordered);
  const averageInstability = ordered.length
    ? ordered.reduce((acc, entity) => acc + entity.localInstability, 0) / ordered.length
    : 0;
  const stability = classifyStability({ centerOfMassX, supportEnvelope, averageInstability });

  return {
    centerOfMassX,
    supportEnvelope,
    averageInstability,
    stabilityClass: stability.label,
    stabilityScore: stability.score
  };
}
