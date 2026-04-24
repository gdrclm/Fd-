import { LAYER_HEIGHT, LAYER_WIDTH } from '../../config/gameConfig.js';
import {
  getIngredientMaterialProfile,
  resolveMaterialType
} from '../../data/materialRegistry.js';
import {
  DROP_INITIAL_VELOCITY_Y,
  DROP_SPAWN_OFFSET_Y
} from '../sceneConstants.js';
import { createIngredientBody } from './createIngredientBody.js';
import { createIngredientVisual } from './createIngredientVisual.js';

/**
 * IngredientEntity factory lifecycle:
 * 1) create game data
 * 2) create Matter body
 * 3) create Pixi display node
 * 4) bind into one entity object
 */
export function createIngredientEntity({
  id,
  ingredientKey,
  x,
  y,
  Matter,
  world,
  PIXI,
  textureCache
}) {
  const materialType = resolveMaterialType(ingredientKey);
  const material = getIngredientMaterialProfile(ingredientKey);

  const width = LAYER_WIDTH;
  const height = LAYER_HEIGHT;
  const baseWidth = LAYER_WIDTH;
  const baseHeight = LAYER_HEIGHT;

  const spawnY = Math.max(0, y - DROP_SPAWN_OFFSET_Y);
  const physicsBody = createIngredientBody({
    Matter,
    x,
    y: spawnY,
    width,
    height,
    material
  });

  Matter.Body.setVelocity(physicsBody, { x: 0, y: DROP_INITIAL_VELOCITY_Y });
  physicsBody.plugin = { ...(physicsBody.plugin ?? {}), entityType: 'ingredient', entityId: id };
  Matter.World.add(world, physicsBody);

  const pixiObject = createIngredientVisual({
    PIXI,
    ingredientKey,
    width,
    height,
    textureCache
  });

  return {
    id,
    ingredientKey,
    name: ingredientKey,
    type: ingredientKey,
    materialType,
    visualType: 'sprite-svg',
    state: 'dropping',
    material,
    pixiObject,
    physicsBody,
    x,
    y: spawnY,
    targetY: y,
    width,
    height,
    baseWidth,
    baseHeight,
    pressure: 0,
    compression: 0,
    tilt: 0,
    stability: 1,
    supportKind: 'none',
    supportingEntityId: null,
    supportingEntityKey: null,
    supportWidth: 0,
    supportRatio: 0,
    lateralOffset: 0,
    contactQuality: 0,
    totalLoadAbove: 0,
    incomingPressure: 0,
    compressionTarget: 0,
    localInstability: 0,
    currentCompression: 0,
    targetCompression: 0,
    widthExpansion: 0,
    recoveryProgress: 0,
    droopAmount: 0,
    leftOverhang: 0,
    rightOverhang: 0,
    pressureFlattening: 0,
    adhesionVisualBias: 0,
    wobblePhase: 0,
    wobbleAmount: 0,
    lateralDriftTarget: 0,
    settleDamping: material.settleDamping ?? 0.7,
    smearWidth: baseWidth,
    smearThickness: baseHeight * 0.24,
    spreadAmount: 0,
    overflowLeft: 0,
    overflowRight: 0,
    slipperinessModifier: 0,
    restFrames: 0,
    isWeaklySupported: true,
    isSlipping: false,
    isCompressed: false,
    isSettling: false
  };
}
