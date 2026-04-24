import {
  COLLISION_CATEGORY_BOUNDARY,
  COLLISION_CATEGORY_INGREDIENT,
  PHYSICS_GRAVITY_Y
} from './sceneConstants.js';

/**
 * Matter.js отвечает только за bodies/collisions/world state/querying.
 * Никакого canvas/render/view-кода здесь быть не должно.
 */
export function createPhysicsWorld() {
  const Matter = globalThis.Matter;
  if (!Matter) {
    throw new Error('Matter.js is not loaded. Expected global Matter from CDN script.');
  }

  const engine = Matter.Engine.create({
    enableSleeping: true
  });
  engine.gravity.y = PHYSICS_GRAVITY_Y;

  const world = engine.world;
  let boundsBodies = [];

  function setWorldBounds(width, height) {
    if (boundsBodies.length) {
      Matter.World.remove(world, boundsBodies);
    }

    const thickness = 140;
    const baseOptions = {
      isStatic: true,
      friction: 0.9,
      restitution: 0,
      collisionFilter: {
        category: COLLISION_CATEGORY_BOUNDARY,
        mask: COLLISION_CATEGORY_INGREDIENT
      }
    };

    boundsBodies = [
      Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, {
        ...baseOptions,
        label: 'scene-floor',
        plugin: { boundaryType: 'floor' }
      }),
      Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
        ...baseOptions,
        label: 'scene-wall-left',
        plugin: { boundaryType: 'wall-left' }
      }),
      Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
        ...baseOptions,
        label: 'scene-wall-right',
        plugin: { boundaryType: 'wall-right' }
      })
    ];

    Matter.World.add(world, boundsBodies);
  }

  return {
    Matter,
    engine,
    world,
    bodies: {},
    setWorldBounds
  };
}
