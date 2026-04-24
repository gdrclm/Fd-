const ISSUE_THRESHOLDS = {
  offCenterOffset: 0.42,
  offCenterSupport: 0.58,
  bunCompression: 0.23,
  bunCompressionHard: 0.32,
  cheeseCoverageMin: 1.08,
  cheeseSupportMin: 0.52,
  produceDriftPx: 10,
  sauceOverflowRatio: 0.2,
  sauceSpreadHigh: 0.62
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createIssue({ id, severity, relatedEntityIds, debugReason, playerFacingLabel }) {
  return {
    id,
    severity: clamp(severity, 0, 1),
    relatedEntityIds,
    debugReason,
    playerFacingLabel
  };
}

function isActiveLayer(entity) {
  return entity.state === 'settling' || entity.state === 'resting';
}

export function analyzeBuildIssues({ entities, stackAnalysis }) {
  const issues = [];

  entities.forEach((entity) => {
    if (!isActiveLayer(entity)) return;

    if (Math.abs(entity.lateralOffset || 0) > ISSUE_THRESHOLDS.offCenterOffset
      && (entity.supportRatio || 0) < ISSUE_THRESHOLDS.offCenterSupport) {
      const severity = clamp(
        (Math.abs(entity.lateralOffset) - ISSUE_THRESHOLDS.offCenterOffset) * 1.6
          + (ISSUE_THRESHOLDS.offCenterSupport - (entity.supportRatio || 0)) * 1.1,
        0.35,
        0.95
      );
      issues.push(createIssue({
        id: 'off-center-placement',
        severity,
        relatedEntityIds: [entity.id],
        debugReason: `offset=${(entity.lateralOffset || 0).toFixed(3)} support=${(entity.supportRatio || 0).toFixed(3)}`,
        playerFacingLabel: 'Слой смещён от центра и плохо опирается.'
      }));
    }

    if (entity.materialType === 'bun' && (entity.currentCompression || 0) > ISSUE_THRESHOLDS.bunCompression) {
      const severity = clamp(
        ((entity.currentCompression || 0) - ISSUE_THRESHOLDS.bunCompression)
          / (ISSUE_THRESHOLDS.bunCompressionHard - ISSUE_THRESHOLDS.bunCompression + 0.001),
        0.35,
        1
      );
      issues.push(createIssue({
        id: 'over-compressed-bun',
        severity,
        relatedEntityIds: [entity.id],
        debugReason: `compression=${(entity.currentCompression || 0).toFixed(3)} incomingPressure=${(entity.incomingPressure || 0).toFixed(3)}`,
        playerFacingLabel: 'Булка слишком сильно смята нагрузкой.'
      }));
    }

    if (entity.materialType === 'cheese') {
      const cheeseCoverage = (entity.baseWidth + (entity.leftOverhang || 0) + (entity.rightOverhang || 0)) / entity.baseWidth;
      if (cheeseCoverage < ISSUE_THRESHOLDS.cheeseCoverageMin || (entity.supportRatio || 0) < ISSUE_THRESHOLDS.cheeseSupportMin) {
        const severity = clamp(
          (ISSUE_THRESHOLDS.cheeseCoverageMin - cheeseCoverage) * 1.8
            + (ISSUE_THRESHOLDS.cheeseSupportMin - (entity.supportRatio || 0)) * 1.1,
          0.3,
          0.92
        );
        issues.push(createIssue({
          id: 'poor-cheese-coverage',
          severity,
          relatedEntityIds: [entity.id, entity.supportingEntityId].filter((id) => typeof id === 'number'),
          debugReason: `coverage=${cheeseCoverage.toFixed(3)} support=${(entity.supportRatio || 0).toFixed(3)}`,
          playerFacingLabel: 'Сыр лег неровно и плохо покрывает слой.'
        }));
      }
    }

    if (entity.materialType === 'produce' && (entity.isSlipping || Math.abs(entity.lateralDriftTarget || 0) > ISSUE_THRESHOLDS.produceDriftPx)) {
      const severity = clamp(
        Math.abs(entity.lateralDriftTarget || 0) / (entity.baseWidth * 0.24)
          + (entity.localInstability || 0) * 0.45,
        0.35,
        0.95
      );
      issues.push(createIssue({
        id: 'produce-slippage',
        severity,
        relatedEntityIds: [entity.id],
        debugReason: `drift=${(entity.lateralDriftTarget || 0).toFixed(2)} slip=${Boolean(entity.isSlipping)} instability=${(entity.localInstability || 0).toFixed(3)}`,
        playerFacingLabel: 'Овощной слой начинает съезжать.'
      }));
    }

    if (entity.materialType === 'sauce') {
      const overflowRatio = ((entity.overflowLeft || 0) + (entity.overflowRight || 0)) / entity.baseWidth;
      if (overflowRatio > ISSUE_THRESHOLDS.sauceOverflowRatio || (entity.spreadAmount || 0) > ISSUE_THRESHOLDS.sauceSpreadHigh) {
        const severity = clamp(
          (overflowRatio - ISSUE_THRESHOLDS.sauceOverflowRatio) * 1.7
            + ((entity.spreadAmount || 0) - ISSUE_THRESHOLDS.sauceSpreadHigh) * 1.3,
          0.28,
          0.88
        );
        issues.push(createIssue({
          id: 'sauce-overflow',
          severity,
          relatedEntityIds: [entity.id],
          debugReason: `overflowRatio=${overflowRatio.toFixed(3)} spread=${(entity.spreadAmount || 0).toFixed(3)}`,
          playerFacingLabel: 'Соус слишком сильно выползает по краям.'
        }));
      }
    }
  });

  if (stackAnalysis?.stabilityClass === 'risky' || stackAnalysis?.stabilityClass === 'unstable') {
    const severity = stackAnalysis.stabilityClass === 'unstable'
      ? 0.85 + (stackAnalysis.stabilityScore || 0) * 0.15
      : 0.45 + (stackAnalysis.stabilityScore || 0) * 0.2;

    issues.push(createIssue({
      id: 'unstable-stack',
      severity,
      relatedEntityIds: entities.filter(isActiveLayer).map((entity) => entity.id),
      debugReason: `stackClass=${stackAnalysis.stabilityClass} score=${(stackAnalysis.stabilityScore || 0).toFixed(3)}`,
      playerFacingLabel: stackAnalysis.stabilityClass === 'unstable'
        ? 'Стек заметно нестабилен.'
        : 'Стек рискованный: возможны смещения.'
    }));
  }

  const uniqueIssueCount = new Set(issues.map((issue) => issue.id)).size;
  const averageSeverity = issues.length
    ? issues.reduce((sum, issue) => sum + issue.severity, 0) / issues.length
    : 0;

  if (uniqueIssueCount >= 3 && averageSeverity > 0.42) {
    issues.push(createIssue({
      id: 'bad-overall-presentation',
      severity: clamp(averageSeverity * 0.75 + uniqueIssueCount * 0.08, 0.4, 0.95),
      relatedEntityIds: entities.filter(isActiveLayer).map((entity) => entity.id),
      debugReason: `issueCount=${uniqueIssueCount} avgSeverity=${averageSeverity.toFixed(3)}`,
      playerFacingLabel: 'Сборка выглядит неаккуратно: много ошибок одновременно.'
    }));
  }

  issues.sort((a, b) => b.severity - a.severity);

  return {
    issues,
    topIssue: issues[0] ?? null,
    issueCount: issues.length,
    averageSeverity: averageSeverity
  };
}
