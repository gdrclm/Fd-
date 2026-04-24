import {
  MAX_ANGULAR_SPEED,
  RESTING_ANGULAR_SPEED_THRESHOLD,
  RESTING_FRAMES_REQUIRED,
  RESTING_SPEED_THRESHOLD,
  SETTLING_ENTER_SPEED
} from '../sceneConstants.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateBunVisualReaction(entity) {
  const pressureFactor = clamp(entity.incomingPressure * 0.18, 0, 0.35);
  const transferredLoadFactor = clamp(entity.totalLoadAbove * 0.03, 0, 0.24);
  const pressureCompressionTarget = clamp(entity.compressionTarget * 0.72 + pressureFactor + transferredLoadFactor, 0, 0.4);

  const isTopBun = (entity.ingredientKey ?? '').includes('Верхняя булочка');
  const targetScale = isTopBun ? pressureCompressionTarget * 0.88 : pressureCompressionTarget;
  entity.targetCompression = clamp(targetScale, 0, 0.4);

  const recoveryBias = isTopBun ? 0.03 : 0.045;
  const riseSpeed = 0.2;
  const fallSpeed = 0.09;

  if (entity.targetCompression >= entity.currentCompression) {
    const delta = entity.targetCompression - entity.currentCompression;
    entity.currentCompression = clamp(entity.currentCompression + delta * riseSpeed, 0, 0.45);
    entity.recoveryProgress = clamp(entity.recoveryProgress * 0.86, 0, 1);
  } else {
    const residualCompression = entity.state === 'resting' ? recoveryBias : recoveryBias * 0.65;
    const recoveringTarget = Math.max(entity.targetCompression, residualCompression);
    const delta = entity.currentCompression - recoveringTarget;
    entity.currentCompression = clamp(entity.currentCompression - delta * fallSpeed, 0, 0.45);
    entity.recoveryProgress = clamp(entity.recoveryProgress + 0.08, 0, 1);
  }

  entity.widthExpansion = clamp(entity.currentCompression * 0.34, 0, 0.16);
}


function updateProduceReaction(entity, Matter) {
  const wobbleResponse = entity.material.wobbleResponse ?? 0.75;
  const driftTarget = clamp(entity.lateralDriftTarget ?? 0, -entity.baseWidth * 0.22, entity.baseWidth * 0.22);
  const damping = clamp(entity.settleDamping ?? 0.45, 0.2, 0.95);

  const instabilityImpulse = clamp(entity.localInstability * 0.55 + Math.abs(driftTarget) / Math.max(entity.baseWidth, 1), 0, 1);
  const pressureImpulse = clamp(entity.incomingPressure * 0.08, 0, 0.25);
  const wobbleTarget = clamp((instabilityImpulse + pressureImpulse) * wobbleResponse, 0, 0.9);

  entity.wobbleAmount = clamp(entity.wobbleAmount * damping + wobbleTarget * (1 - damping), 0, 1);
  entity.wobblePhase += 0.12 + entity.wobbleAmount * 0.2;

  const activeDrift = entity.state === 'settling' || entity.state === 'resting';
  if (activeDrift) {
    const driftStep = clamp(driftTarget * 0.08, -1.25, 1.25);
    if (Math.abs(driftStep) > 0.001) {
      Matter.Body.setPosition(entity.physicsBody, {
        x: entity.physicsBody.position.x + driftStep,
        y: entity.physicsBody.position.y
      });
    }
  }

  if (entity.state === 'resting') {
    entity.wobbleAmount = clamp(entity.wobbleAmount * (0.92 + damping * 0.04), 0, 1);
  }
}


function updateSauceReaction(entity) {
  const supportPenalty = 1 - clamp(entity.supportRatio ?? 0, 0, 1);
  const pressureBias = clamp(entity.incomingPressure * 0.2 + entity.totalLoadAbove * 0.03, 0, 0.9);
  const spreadTarget = clamp((entity.spreadAmount ?? 0) * 0.65 + pressureBias * 0.35 + supportPenalty * 0.15, 0, 1);

  entity.spreadAmount = clamp(entity.spreadAmount * 0.8 + spreadTarget * 0.2, 0, 1);

  const targetSmearWidth = entity.baseWidth * (1 + entity.spreadAmount * 0.42);
  const targetThickness = clamp(
    entity.baseHeight * (0.3 - entity.spreadAmount * 0.14 - pressureBias * 0.06),
    entity.baseHeight * 0.1,
    entity.baseHeight * 0.34
  );

  const lateralSkew = clamp(entity.lateralOffset ?? 0, -1, 1);
  const baseOverflow = entity.baseWidth * entity.spreadAmount * 0.16;
  const leftOverflowTarget = clamp(baseOverflow - lateralSkew * entity.baseWidth * 0.04, 0, entity.baseWidth * 0.22);
  const rightOverflowTarget = clamp(baseOverflow + lateralSkew * entity.baseWidth * 0.04, 0, entity.baseWidth * 0.22);

  entity.smearWidth = clamp(entity.smearWidth * 0.78 + targetSmearWidth * 0.22, entity.baseWidth, entity.baseWidth * 1.6);
  entity.smearThickness = clamp(entity.smearThickness * 0.75 + targetThickness * 0.25, entity.baseHeight * 0.08, entity.baseHeight * 0.36);
  entity.overflowLeft = clamp(entity.overflowLeft * 0.78 + leftOverflowTarget * 0.22, 0, entity.baseWidth * 0.25);
  entity.overflowRight = clamp(entity.overflowRight * 0.78 + rightOverflowTarget * 0.22, 0, entity.baseWidth * 0.25);

  const slipperinessTarget = clamp(entity.material.smearFactor * 0.45 + entity.spreadAmount * 0.55, 0, 1);
  entity.slipperinessModifier = clamp(entity.slipperinessModifier * 0.8 + slipperinessTarget * 0.2, 0, 1);
}

function updateCheeseVisualReaction(entity) {
  const supportPenalty = 1 - clamp(entity.supportRatio ?? 0, 0, 1);
  const pressureFactor = clamp(entity.incomingPressure * 0.24, 0, 0.42);
  const loadFactor = clamp(entity.totalLoadAbove * 0.035, 0, 0.3);

  const baseOverhang = entity.baseWidth * supportPenalty * 0.36;
  const skew = clamp(entity.lateralOffset ?? 0, -1, 1) * entity.baseWidth * 0.09;
  const targetLeftOverhang = clamp(baseOverhang - skew, 0, entity.baseWidth * 0.24);
  const targetRightOverhang = clamp(baseOverhang + skew, 0, entity.baseWidth * 0.24);

  const targetDroop = clamp(
    supportPenalty * 0.28 + pressureFactor * 0.42 + loadFactor * 0.3,
    0,
    0.42
  );
  const targetFlattening = clamp(
    entity.compressionTarget * 0.6 + pressureFactor * 0.4,
    0,
    0.5
  );

  const targetAdhesionBias = clamp(
    entity.material.adhesion * 0.55 + (entity.contactQuality ?? 0) * 0.45,
    0,
    1
  );

  entity.leftOverhang = clamp(entity.leftOverhang * 0.82 + targetLeftOverhang * 0.18, 0, entity.baseWidth * 0.25);
  entity.rightOverhang = clamp(entity.rightOverhang * 0.82 + targetRightOverhang * 0.18, 0, entity.baseWidth * 0.25);
  entity.droopAmount = clamp(entity.droopAmount * 0.8 + targetDroop * 0.2, 0, 0.45);
  entity.pressureFlattening = clamp(entity.pressureFlattening * 0.76 + targetFlattening * 0.24, 0, 0.55);
  entity.adhesionVisualBias = clamp(entity.adhesionVisualBias * 0.86 + targetAdhesionBias * 0.14, 0, 1);
}

/**
 * Centralized sync between Matter body and entity state.
 * Pixi sync lives in sceneRenderer.
 */
export function syncEntityFromPhysics(entity, Matter) {
  const body = entity.physicsBody;
  const material = entity.material;

  const speed = Math.hypot(body.velocity.x, body.velocity.y);
  const angularSpeed = Math.abs(body.angularVelocity);

  if (angularSpeed > MAX_ANGULAR_SPEED) {
    Matter.Body.setAngularVelocity(
      body,
      Math.sign(body.angularVelocity || 1) * MAX_ANGULAR_SPEED
    );
  }

  if (entity.state !== 'grabbed') {
    if (entity.state === 'dropping' && speed <= SETTLING_ENTER_SPEED) {
      entity.state = 'settling';
      entity.isSettling = true;
      entity.restFrames = 0;
    }

    if (entity.state === 'settling') {
      const belowRestThreshold = speed <= RESTING_SPEED_THRESHOLD
        && angularSpeed <= RESTING_ANGULAR_SPEED_THRESHOLD;

      entity.restFrames = belowRestThreshold ? entity.restFrames + 1 : 0;

      if (entity.restFrames >= RESTING_FRAMES_REQUIRED) {
        entity.state = 'resting';
        entity.isSettling = false;
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
      }
    }

    if (entity.state === 'resting' && speed > SETTLING_ENTER_SPEED * 1.25) {
      entity.state = 'dropping';
      entity.isSettling = false;
      entity.restFrames = 0;
    }
  }

  entity.x = body.position.x - entity.width / 2;
  entity.y = body.position.y - entity.height / 2;
  entity.tilt = body.angle;

  const supportRatio = clamp(entity.supportRatio ?? 0, 0, 1);
  const lateralOffset = clamp(entity.lateralOffset ?? 0, -1, 1);
  const contactQuality = clamp(entity.contactQuality ?? 0, 0, 1);

  const targetCompression = Math.min(
    1,
    (1 - supportRatio) * material.lateralSpread * 0.45
      + Math.abs(lateralOffset) * material.lateralSpread * 0.35
  );
  const resistance = Math.max(material.compressionResistance, 0.01);
  const supportCompression = clamp((targetCompression * (0.5 + contactQuality * 0.5)) / resistance, 0, 1);
  const pressureCompression = clamp(entity.compressionTarget ?? 0, 0, 1);
  entity.compression = clamp(supportCompression * 0.55 + pressureCompression * 0.45, 0, 1);
  entity.pressure = clamp(entity.pressure * 0.88 + entity.compression * 0.12, 0, 1);

  entity.isCompressed = entity.compression > material.crumbleThreshold;
  entity.isSlipping = Math.abs(lateralOffset) > (0.22 + material.smearFactor * 0.35) || supportRatio < 0.35;

  const localInstability = clamp(entity.localInstability ?? 0, 0, 1);
  const stabilityFromSupport = supportRatio * 0.55
    + (1 - Math.abs(lateralOffset)) * 0.2
    + contactQuality * 0.15
    + (1 - localInstability) * 0.1;
  entity.stability = clamp(
    entity.stability * (1 - material.recoverySpeed * 0.08)
      + stabilityFromSupport * material.recoverySpeed * 0.08,
    0,
    1
  );

  if (entity.materialType === 'bun') {
    updateBunVisualReaction(entity);
    entity.droopAmount = 0;
    entity.leftOverhang = 0;
    entity.rightOverhang = 0;
    entity.pressureFlattening = 0;
    entity.adhesionVisualBias = 0;
    entity.wobbleAmount = 0;
    entity.wobblePhase = 0;
    entity.smearWidth = entity.baseWidth;
    entity.smearThickness = entity.baseHeight * 0.24;
    entity.overflowLeft = 0;
    entity.overflowRight = 0;
    entity.spreadAmount = 0;
    entity.slipperinessModifier = 0;
  } else if (entity.materialType === 'cheese') {
    updateCheeseVisualReaction(entity);
    entity.targetCompression = 0;
    entity.currentCompression = 0;
    entity.widthExpansion = 0;
    entity.recoveryProgress = 0;
    entity.wobbleAmount = 0;
    entity.wobblePhase = 0;
    entity.smearWidth = entity.baseWidth;
    entity.smearThickness = entity.baseHeight * 0.24;
    entity.overflowLeft = 0;
    entity.overflowRight = 0;
    entity.spreadAmount = 0;
    entity.slipperinessModifier = 0;
  } else if (entity.materialType === 'produce') {
    updateProduceReaction(entity, Matter);
    entity.targetCompression = 0;
    entity.currentCompression = 0;
    entity.widthExpansion = 0;
    entity.recoveryProgress = 0;
    entity.droopAmount = 0;
    entity.leftOverhang = 0;
    entity.rightOverhang = 0;
    entity.pressureFlattening = 0;
    entity.adhesionVisualBias = 0;
    entity.smearWidth = entity.baseWidth;
    entity.smearThickness = entity.baseHeight * 0.24;
    entity.overflowLeft = 0;
    entity.overflowRight = 0;
    entity.spreadAmount = 0;
    entity.slipperinessModifier = 0;
  } else if (entity.materialType === 'sauce') {
    updateSauceReaction(entity);
    entity.targetCompression = 0;
    entity.currentCompression = 0;
    entity.widthExpansion = 0;
    entity.recoveryProgress = 0;
    entity.droopAmount = 0;
    entity.leftOverhang = 0;
    entity.rightOverhang = 0;
    entity.pressureFlattening = 0;
    entity.adhesionVisualBias = 0;
    entity.wobbleAmount = 0;
    entity.wobblePhase = 0;
  } else {
    entity.targetCompression = 0;
    entity.currentCompression = 0;
    entity.widthExpansion = 0;
    entity.recoveryProgress = 0;
    entity.droopAmount = 0;
    entity.leftOverhang = 0;
    entity.rightOverhang = 0;
    entity.pressureFlattening = 0;
    entity.adhesionVisualBias = 0;
    entity.wobbleAmount = 0;
    entity.wobblePhase = 0;
    entity.smearWidth = entity.baseWidth;
    entity.smearThickness = entity.baseHeight * 0.24;
    entity.overflowLeft = 0;
    entity.overflowRight = 0;
    entity.spreadAmount = 0;
    entity.slipperinessModifier = 0;
  }
}

export function syncEntitiesFromPhysics(entities, Matter) {
  entities.forEach((entity) => syncEntityFromPhysics(entity, Matter));
}
