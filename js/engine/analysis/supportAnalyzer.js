function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getBodyCenterX(body) {
  return body.position.x;
}

function getSupportCenterX(otherBody, supports, fallbackWidth) {
  if (supports.length >= 2) {
    return (supports[0].x + supports[1].x) / 2;
  }
  if (supports.length === 1) {
    return supports[0].x;
  }
  return getBodyCenterX(otherBody) + fallbackWidth / 2;
}

function getSupportWidth(supports, fallbackWidth) {
  if (supports.length >= 2) {
    return Math.abs(supports[0].x - supports[1].x);
  }
  if (supports.length === 1) {
    return Math.max(8, fallbackWidth * 0.2);
  }
  return fallbackWidth;
}

function isGroundSupportBody(body) {
  return body.isStatic && body.plugin?.boundaryType === 'floor';
}

function isSupportFromBelow(entityBody, otherBody) {
  const entityBottom = entityBody.bounds.max.y;
  const otherCenterY = otherBody.position.y;
  return otherCenterY >= entityBottom - 10;
}

function normalizeOffset(entityCenterX, supportCenterX, entityWidth) {
  return clamp((entityCenterX - supportCenterX) / Math.max(entityWidth / 2, 1), -1, 1);
}

function scoreContactQuality({ supportRatio, normalizedOffset, depth }) {
  const alignment = 1 - Math.abs(normalizedOffset);
  const penetrationBoost = clamp(depth / 4, 0, 0.25);
  return clamp(supportRatio * 0.65 + alignment * 0.35 + penetrationBoost, 0, 1);
}

/**
 * Gameplay-level support analyzer on top of Matter collision pairs.
 * Matter provides collision contacts; this layer converts them to support metrics.
 */
export function analyzeSupportMetrics({ entities, engine }) {
  const bodyToEntity = new Map();
  entities.forEach((entity) => {
    bodyToEntity.set(entity.physicsBody, entity);
    entity.supportingEntityId = null;
    entity.supportingEntityKey = null;
    entity.supportKind = 'none';
    entity.supportWidth = 0;
    entity.supportRatio = 0;
    entity.contactQuality = 0;
    entity.isWeaklySupported = true;
  });

  const pairs = engine.pairs?.list ?? [];

  pairs.forEach((pair) => {
    if (!pair.isActive || !pair.collision) return;

    const candidates = [
      { body: pair.bodyA, other: pair.bodyB },
      { body: pair.bodyB, other: pair.bodyA }
    ];

    candidates.forEach(({ body, other }) => {
      const entity = bodyToEntity.get(body);
      if (!entity) return;

      const supportingEntity = bodyToEntity.get(other) ?? null;
      const isGroundSupport = isGroundSupportBody(other);
      const isEntitySupport = Boolean(supportingEntity);
      if (!isGroundSupport && !isEntitySupport) return;
      if (!isSupportFromBelow(body, other)) return;

      const supports = pair.collision.supports ?? [];
      const fallbackWidth = isEntitySupport ? supportingEntity.width : entity.width;
      const supportWidth = clamp(getSupportWidth(supports, fallbackWidth), 0, entity.width);
      const supportRatio = clamp(supportWidth / Math.max(entity.width, 1), 0, 1);
      const supportCenterX = getSupportCenterX(other, supports, fallbackWidth);
      const normalizedOffset = normalizeOffset(body.position.x, supportCenterX, entity.width);
      const contactQuality = scoreContactQuality({
        supportRatio,
        normalizedOffset,
        depth: pair.collision.depth ?? 0
      });

      if (contactQuality <= entity.contactQuality) return;

      entity.supportingEntityId = supportingEntity?.id ?? 'ground';
      entity.supportingEntityKey = supportingEntity?.ingredientKey ?? 'ground';
      entity.supportKind = isGroundSupport ? 'ground' : 'entity';
      entity.supportWidth = supportWidth;
      entity.supportRatio = supportRatio;
      entity.lateralOffset = normalizedOffset;
      entity.contactQuality = contactQuality;
      entity.isWeaklySupported = supportRatio < 0.45 || Math.abs(normalizedOffset) > 0.52;
    });
  });
}
