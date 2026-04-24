import {
  COLLISION_CATEGORY_BOUNDARY,
  COLLISION_CATEGORY_INGREDIENT
} from '../sceneConstants.js';

/**
 * Matter helper: creates physics body for IngredientEntity.
 * Только body/world-данные, без Pixi/UI.
 */
export function createIngredientBody({ Matter, x, y, width, height, material, options = {} }) {
  const body = Matter.Bodies.rectangle(
    x + width / 2,
    y + height / 2,
    width,
    height,
    {
      friction: material.friction,
      frictionAir: 0.018 + (1 - material.recoverySpeed) * 0.032,
      frictionStatic: Math.min(1, material.friction + material.adhesion * 0.25),
      restitution: Math.min(material.restitution, 0.04),
      density: material.density,
      chamfer: { radius: Math.min(height * 0.14, 6) },
      slop: 0.04,
      sleepThreshold: 18,
      collisionFilter: {
        category: COLLISION_CATEGORY_INGREDIENT,
        mask: COLLISION_CATEGORY_INGREDIENT | COLLISION_CATEGORY_BOUNDARY
      },
      ...options
    }
  );

  return body;
}
