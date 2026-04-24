import { createLayer } from '../logic/legacyStackBridge.js';

export function renderReference(referenceStackEl, currentOrder) {
  referenceStackEl.innerHTML = '';
  [...currentOrder].reverse().forEach((ingredient) => {
    const layer = createLayer(ingredient, false);
    layer.classList.add('ingredient-layer-reference');
    referenceStackEl.appendChild(layer);
  });
}
