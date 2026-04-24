import { ingredientSvgs } from '../../data/ingredients.js';


function createSauceVisual({ PIXI, width, height }) {
  const container = new PIXI.Container();
  const smear = new PIXI.Graphics();

  smear.beginFill(0xf39a30, 0.95);
  smear.drawRoundedRect(0, height * 0.48, width, Math.max(8, height * 0.24), 10);
  smear.endFill();

  container.addChild(smear);
  container.hitArea = new PIXI.Rectangle(0, 0, width, height);
  container.__isSauceVisual = true;
  container.__sauceSmear = smear;

  return container;
}

function createCheeseVisual({ PIXI, width, height }) {
  const container = new PIXI.Container();
  const sheet = new PIXI.Graphics();

  sheet.beginFill(0xf7c63d, 1);
  sheet.drawRoundedRect(0, 0, width, height, Math.max(4, height * 0.28));
  sheet.endFill();

  container.addChild(sheet);
  container.hitArea = new PIXI.Rectangle(0, 0, width, height);
  container.__isCheeseVisual = true;
  container.__cheeseSheet = sheet;

  return container;
}

/**
 * Pixi helper: creates display object for IngredientEntity.
 * Только visual node, без Matter/UI.
 */
export function createIngredientVisual({ PIXI, ingredientKey, width, height, textureCache }) {
  if (ingredientKey === 'Сыр') {
    return createCheeseVisual({ PIXI, width, height });
  }

  if (ingredientKey === 'Соус') {
    return createSauceVisual({ PIXI, width, height });
  }

  let texture = textureCache.get(ingredientKey);
  if (!texture) {
    const svg = ingredientSvgs[ingredientKey] ?? ingredientSvgs['Нижняя булочка'];
    texture = PIXI.Texture.from(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    textureCache.set(ingredientKey, texture);
  }

  const sprite = new PIXI.Sprite(texture);
  sprite.width = width;
  sprite.height = height;
  sprite.anchor.set(0, 0);

  return sprite;
}
