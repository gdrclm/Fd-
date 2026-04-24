import { ingredientSvgs } from '../data/ingredients.js';

const DRAG_START_DISTANCE = 8;
const DROP_ZONE_PADDING = 20;

function distance(aX, aY, bX, bY) {
  return Math.hypot(aX - bX, aY - bY);
}

function isWithinDropZone(stackEl, clientX, clientY) {
  const rect = stackEl.getBoundingClientRect();
  return clientX >= rect.left - DROP_ZONE_PADDING
    && clientX <= rect.right + DROP_ZONE_PADDING
    && clientY >= rect.top - DROP_ZONE_PADDING
    && clientY <= rect.bottom + DROP_ZONE_PADDING;
}

function ensurePreviewElement() {
  let el = document.getElementById('tray-drag-preview');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'tray-drag-preview';
  el.className = 'tray-drag-preview';
  el.hidden = true;
  document.body.appendChild(el);
  return el;
}

/**
 * Mobile-first pointer controller for tray -> scene flow.
 * No HTML5 DnD and no DOM clone-hacks.
 */
export function createTrayDragController({
  ingredientsEl,
  stackEl,
  isGameLocked,
  canAddMore,
  onDropIngredient,
  setStatus
}) {
  const previewEl = ensurePreviewElement();
  let drag = null;

  function cleanupDrag() {
    if (!drag) return;
    stackEl.classList.remove('drop-active');
    previewEl.hidden = true;
    previewEl.innerHTML = '';
    drag = null;
  }

  function handlePointerDown(event) {
    const card = event.target.closest('.ingredient-card');
    if (!card || !ingredientsEl.contains(card)) return;
    if (isGameLocked()) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const ingredient = card.dataset.ingredient;
    if (!ingredient) return;

    card.setPointerCapture(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      ingredient,
      card,
      startX: event.clientX,
      startY: event.clientY,
      didDrag: false
    };
  }

  function handlePointerMove(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const moved = distance(drag.startX, drag.startY, event.clientX, event.clientY);
    if (!drag.didDrag && moved >= DRAG_START_DISTANCE) {
      drag.didDrag = true;
      previewEl.hidden = false;
      previewEl.innerHTML = `<span class="tray-drag-preview-image">${ingredientSvgs[drag.ingredient]}</span>`;
      setStatus('Перетащи ингредиент в сцену и отпусти.', '');
    }

    if (!drag.didDrag) return;

    previewEl.style.left = `${event.clientX}px`;
    previewEl.style.top = `${event.clientY}px`;

    const canDrop = isWithinDropZone(stackEl, event.clientX, event.clientY);
    stackEl.classList.toggle('drop-active', canDrop);
  }

  function handlePointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const local = drag;
    const moved = distance(local.startX, local.startY, event.clientX, event.clientY);
    const validDrop = local.didDrag && isWithinDropZone(stackEl, event.clientX, event.clientY);

    if (!local.didDrag && moved < DRAG_START_DISTANCE) {
      const label = local.card.querySelector('.ingredient-card-label');
      if (label) {
        const visible = !label.hasAttribute('hidden');
        if (visible) label.setAttribute('hidden', '');
        else label.removeAttribute('hidden');
        local.card.classList.toggle('ingredient-card-expanded', !visible);
      }
      cleanupDrag();
      return;
    }

    if (!validDrop) {
      cleanupDrag();
      setStatus('Отмена: отпусти ингредиент над сценой, чтобы добавить слой.', 'bad');
      return;
    }

    if (!canAddMore()) {
      cleanupDrag();
      setStatus('Все слои уже на месте. Удали лишнее или проверь.', 'bad');
      return;
    }

    onDropIngredient({
      ingredient: local.ingredient,
      clientX: event.clientX,
      clientY: event.clientY
    });

    cleanupDrag();
  }

  function handlePointerCancel(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    cleanupDrag();
  }

  ingredientsEl.addEventListener('pointerdown', handlePointerDown);
  ingredientsEl.addEventListener('pointermove', handlePointerMove);
  ingredientsEl.addEventListener('pointerup', handlePointerUp);
  ingredientsEl.addEventListener('pointercancel', handlePointerCancel);

  return {
    destroy() {
      ingredientsEl.removeEventListener('pointerdown', handlePointerDown);
      ingredientsEl.removeEventListener('pointermove', handlePointerMove);
      ingredientsEl.removeEventListener('pointerup', handlePointerUp);
      ingredientsEl.removeEventListener('pointercancel', handlePointerCancel);
      cleanupDrag();
      previewEl.remove();
    }
  };
}
