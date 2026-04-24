export const MATERIAL_REGISTRY = {
  bun: {
    density: 0.0044,
    friction: 0.74,
    restitution: 0.02,
    compressionResistance: 0.78,
    plasticity: 0.32,
    adhesion: 0.42,
    lateralSpread: 0.2,
    wobble: 0.1,
    droop: 0.12,
    recoverySpeed: 0.64,
    crumbleThreshold: 0.86,
    smearFactor: 0.04,
    supportForgiveness: 0.78,
    driftSensitivity: 0.18,
    settleDamping: 0.82,
    wobbleResponse: 0.16
  },
  patty: {
    density: 0.0058,
    friction: 0.68,
    restitution: 0.01,
    compressionResistance: 0.9,
    plasticity: 0.22,
    adhesion: 0.34,
    lateralSpread: 0.14,
    wobble: 0.08,
    droop: 0.1,
    recoverySpeed: 0.58,
    crumbleThreshold: 0.93,
    smearFactor: 0.03,
    supportForgiveness: 0.84,
    driftSensitivity: 0.12,
    settleDamping: 0.88,
    wobbleResponse: 0.1
  },
  cheese: {
    density: 0.0032,
    friction: 0.86,
    restitution: 0.01,
    compressionResistance: 0.44,
    plasticity: 0.88,
    adhesion: 0.91,
    lateralSpread: 0.56,
    wobble: 0.24,
    droop: 0.5,
    recoverySpeed: 0.18,
    crumbleThreshold: 0.25,
    smearFactor: 0.74,
    supportForgiveness: 0.56,
    driftSensitivity: 0.34,
    settleDamping: 0.54,
    wobbleResponse: 0.46
  },
  produce: {
    density: 0.003,
    friction: 0.58,
    restitution: 0.03,
    compressionResistance: 0.4,
    plasticity: 0.52,
    adhesion: 0.5,
    lateralSpread: 0.34,
    wobble: 0.46,
    droop: 0.28,
    recoverySpeed: 0.42,
    crumbleThreshold: 0.36,
    smearFactor: 0.22,
    supportForgiveness: 0.3,
    driftSensitivity: 0.72,
    settleDamping: 0.42,
    wobbleResponse: 0.82
  },
  sauce: {
    density: 0.0017,
    friction: 0.92,
    restitution: 0,
    compressionResistance: 0.08,
    plasticity: 0.98,
    adhesion: 0.97,
    lateralSpread: 0.92,
    wobble: 0.78,
    droop: 0.95,
    recoverySpeed: 0.06,
    crumbleThreshold: 0.05,
    smearFactor: 0.98,
    supportForgiveness: 0.2,
    driftSensitivity: 0.54,
    settleDamping: 0.3,
    wobbleResponse: 0.7
  }
};

export const INGREDIENT_TO_MATERIAL = {
  'Нижняя булочка': 'bun',
  'Верхняя булочка': 'bun',
  'Котлета': 'patty',
  'Сыр': 'cheese',
  'Лист салата': 'produce',
  'Помидор': 'produce',
  'Бекон': 'patty',
  'Лук': 'produce',
  'Огурец': 'produce',
  'Грибы': 'produce',
  'Соус': 'sauce'
};

export function resolveMaterialType(ingredientKey) {
  return INGREDIENT_TO_MATERIAL[ingredientKey] ?? 'produce';
}

export function getMaterialProfile(materialType) {
  return MATERIAL_REGISTRY[materialType] ?? MATERIAL_REGISTRY.produce;
}

export function getIngredientMaterialProfile(ingredientKey) {
  return getMaterialProfile(resolveMaterialType(ingredientKey));
}
