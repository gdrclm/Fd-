import { ingredientSvgs } from '../data/ingredients.js';
import { shuffle } from '../utils/math.js';

export function renderIngredientTray({ ingredientsEl, getCurrentOrder }) {
  ingredientsEl.innerHTML = '';

  shuffle(getCurrentOrder()).forEach((ingredient) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'ingredient-card';
    card.dataset.ingredient = ingredient;
    card.innerHTML = `<span class="ingredient-card-image">${ingredientSvgs[ingredient]}</span><span class="ingredient-card-label" hidden>${ingredient}</span>`;
    ingredientsEl.appendChild(card);
  });
}
