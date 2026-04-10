const ROUND_TIME_SECONDS = 60;

const ingredientSvgs = {
  'Нижняя булочка': `<svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="10" y="14" width="200" height="44" rx="20" fill="#d99a4e"/><rect x="10" y="10" width="200" height="30" rx="15" fill="#e9b165"/></svg>`,
  'Котлета': `<svg viewBox="0 0 220 55" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 17 C38 6, 182 6, 212 17 L212 39 C182 49, 38 49, 8 39 Z" fill="#653325"/><path d="M20 24 C52 18, 168 18, 200 24" stroke="#7f4231" stroke-width="4" fill="none"/></svg>`,
  'Сыр': `<svg viewBox="0 0 220 54" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 16 L206 16 L186 42 L34 42 Z" fill="#f7c63d"/><circle cx="64" cy="28" r="4" fill="#edb52d"/><circle cx="118" cy="25" r="3.5" fill="#edb52d"/><circle cx="160" cy="32" r="4.5" fill="#edb52d"/></svg>`,
  'Лист салата': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 36 C20 12, 40 44, 56 24 C72 8, 88 42, 104 22 C120 8, 138 44, 154 24 C170 8, 190 42, 212 18 L212 42 L8 42 Z" fill="#47b34e"/><path d="M24 35 C52 22, 168 22, 196 35" stroke="#31863a" stroke-width="3" fill="none"/></svg>`,
  'Помидор': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="58" cy="26" rx="42" ry="12" fill="#e64d3d"/><ellipse cx="110" cy="26" rx="42" ry="12" fill="#ee5b4a"/><ellipse cx="162" cy="26" rx="42" ry="12" fill="#e64d3d"/></svg>`,
  'Верхняя булочка': `<svg viewBox="0 0 220 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 70 C10 26, 50 10, 110 10 C170 10, 210 26, 210 70 Z" fill="#e8ad62"/><path d="M10 70 C10 34, 48 20, 110 20 C172 20, 210 34, 210 70" fill="#f0bc72"/></svg>`,
  'Бекон': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 35 C35 10, 70 43, 105 19 C140 3, 172 31, 210 12 L210 37 C170 50, 140 22, 105 37 C70 51, 35 22, 10 45 Z" fill="#c14337"/></svg>`,
  'Лук': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="72" cy="26" rx="46" ry="13" fill="none" stroke="#caa9f8" stroke-width="8"/><ellipse cx="148" cy="26" rx="46" ry="13" fill="none" stroke="#b08bec" stroke-width="8"/></svg>`,
  'Огурец': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="62" cy="26" r="16" fill="#6fc157"/><circle cx="110" cy="26" r="16" fill="#71c75a"/><circle cx="158" cy="26" r="16" fill="#6fc157"/></svg>`,
  'Грибы': `<svg viewBox="0 0 220 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M40 30 C40 18, 58 12, 74 12 C90 12, 108 18, 108 30 Z" fill="#d7bea2"/><rect x="66" y="30" width="16" height="16" rx="6" fill="#f2e1cc"/><path d="M112 30 C112 18, 130 12, 146 12 C162 12, 180 18, 180 30 Z" fill="#cdb294"/><rect x="138" y="30" width="16" height="16" rx="6" fill="#ead7c0"/></svg>`,
  'Соус': `<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 24 C34 8, 54 40, 76 24 C98 8, 120 40, 142 24 C164 8, 186 40, 208 24" stroke="#f39a30" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`
};

const levels = [
  ['Нижняя булочка', 'Котлета', 'Сыр', 'Лист салата', 'Помидор', 'Верхняя булочка'],
  ['Нижняя булочка', 'Котлета', 'Сыр', 'Бекон', 'Лист салата', 'Помидор', 'Верхняя булочка'],
  ['Нижняя булочка', 'Котлета', 'Сыр', 'Лук', 'Бекон', 'Лист салата', 'Помидор', 'Верхняя булочка'],
  ['Нижняя булочка', 'Котлета', 'Сыр', 'Огурец', 'Лук', 'Бекон', 'Лист салата', 'Помидор', 'Верхняя булочка'],
  ['Нижняя булочка', 'Котлета', 'Грибы', 'Сыр', 'Огурец', 'Лук', 'Бекон', 'Лист салата', 'Помидор', 'Верхняя булочка'],
  ['Нижняя булочка', 'Котлета', 'Грибы', 'Сыр', 'Огурец', 'Лук', 'Бекон', 'Соус', 'Лист салата', 'Помидор', 'Верхняя булочка']
];

const placedLayers = [];
let currentLevel = 0;
let timeLeft = ROUND_TIME_SECONDS;
let timerId = null;
let gameLocked = false;
let nextLayerId = 1;
let dragState = null;
let layerDragState = null;
let fxIntervalId = null;
let physicsFrameId = null;

const ingredientPhysics = {
  'Нижняя булочка': { mass: 2.2, volume: 2.3, viscosity: 0.82, stickiness: 0.76 },
  'Котлета': { mass: 2.8, volume: 1.5, viscosity: 0.74, stickiness: 0.7 },
  'Сыр': { mass: 1.2, volume: 1.1, viscosity: 0.92, stickiness: 0.93 },
  'Лист салата': { mass: 0.7, volume: 1.4, viscosity: 0.64, stickiness: 0.52 },
  'Помидор': { mass: 1.1, volume: 1.4, viscosity: 0.67, stickiness: 0.62 },
  'Верхняя булочка': { mass: 2.1, volume: 2.4, viscosity: 0.8, stickiness: 0.74 },
  'Бекон': { mass: 1.3, volume: 1.2, viscosity: 0.69, stickiness: 0.66 },
  'Лук': { mass: 0.8, volume: 1.1, viscosity: 0.72, stickiness: 0.58 },
  'Огурец': { mass: 0.9, volume: 1.2, viscosity: 0.76, stickiness: 0.63 },
  'Грибы': { mass: 1.1, volume: 1.4, viscosity: 0.79, stickiness: 0.7 },
  'Соус': { mass: 0.5, volume: 0.8, viscosity: 0.95, stickiness: 0.96 }
};

const stackEl = document.getElementById('stack');
const referenceStackEl = document.getElementById('reference-stack');
const statusEl = document.getElementById('status');
const levelInfoEl = document.getElementById('level-info');
const timerEl = document.getElementById('timer');
const ingredientsEl = document.getElementById('ingredients');
const checkButton = document.getElementById('check');
const clearButton = document.getElementById('clear');
const overlayEl = document.getElementById('level-complete-overlay');
const overlayTitleEl = document.getElementById('overlay-title');
const celebrationBurgerEl = document.getElementById('celebration-burger');
const fxLayerEl = document.getElementById('fx-layer');
const restartLevelButton = document.getElementById('restart-level');
const nextLevelButton = document.getElementById('next-level');

function getCurrentOrder() { return levels[currentLevel]; }

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `⏱ ${mm}:${ss}`;
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = ROUND_TIME_SECONDS;
  timerEl.textContent = formatTime(timeLeft);

  timerId = setInterval(() => {
    timeLeft -= 1;
    timerEl.textContent = formatTime(Math.max(timeLeft, 0));

    if (timeLeft <= 0) {
      clearInterval(timerId);
      gameLocked = true;
      setStatus('⌛ Время вышло. Нажми «Сбросить», чтобы попробовать снова.', 'bad');
    }
  }, 1000);
}

function setStatus(message, tone = '') {
  statusEl.textContent = message;
  statusEl.classList.remove('ok', 'bad');
  if (tone) statusEl.classList.add(tone);
}

function createLayer(name, interactive = false) {
  const layer = document.createElement('button');
  layer.type = 'button';
  layer.className = 'ingredient-layer';
  layer.innerHTML = ingredientSvgs[name] ?? ingredientSvgs['Нижняя булочка'];

  if (interactive) {
    layer.classList.add('ingredient-layer-clickable');
  }

  return layer;
}

function renderReference() {
  referenceStackEl.innerHTML = '';
  const visual = [...getCurrentOrder()].reverse();
  visual.forEach((ingredient) => {
    const layer = createLayer(ingredient, false);
    layer.classList.add('ingredient-layer-reference');
    referenceStackEl.appendChild(layer);
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSafePlacement(clientX, clientY) {
  const rect = stackEl.getBoundingClientRect();
  const layerWidth = Math.min(rect.width, 220);
  const layerHeight = 48;
  const x = clamp(clientX - rect.left - layerWidth / 2, 0, Math.max(rect.width - layerWidth, 0));
  const y = clamp(clientY - rect.top - layerHeight / 2, 0, Math.max(rect.height - layerHeight, 0));
  return { x, y };
}

function renderStack() {
  stackEl.innerHTML = '';

  placedLayers.forEach((item, index) => {
    const layer = createLayer(item.name, true);
    layer.style.position = 'absolute';
    layer.style.left = `${item.x}px`;
    layer.style.top = `${item.y}px`;
    layer.style.zIndex = String(100 + index);
    layer.title = `Переместить: ${item.name}`;
    layer.dataset.layerId = String(item.id);

    layer.addEventListener('pointerdown', (event) => {
      if (gameLocked) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const targetLayer = placedLayers.find((entry) => entry.id === item.id);
      if (!targetLayer) return;

      const stackRect = stackEl.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();
      layer.setPointerCapture(event.pointerId);
      layer.classList.add('ingredient-layer-dragging');
      layerDragState = {
        pointerId: event.pointerId,
        layerId: targetLayer.id,
        offsetX: event.clientX - layerRect.left,
        offsetY: event.clientY - layerRect.top,
        width: layerRect.width,
        height: layerRect.height,
        stackRect
      };
      event.preventDefault();
    });

    layer.addEventListener('pointermove', (event) => {
      if (!layerDragState || layerDragState.pointerId !== event.pointerId) return;
      const targetLayer = placedLayers.find((entry) => entry.id === layerDragState.layerId);
      if (!targetLayer) return;

      const x = clamp(
        event.clientX - layerDragState.stackRect.left - layerDragState.offsetX,
        0,
        Math.max(layerDragState.stackRect.width - layerDragState.width, 0)
      );
      const y = clamp(
        event.clientY - layerDragState.stackRect.top - layerDragState.offsetY,
        0,
        Math.max(layerDragState.stackRect.height - layerDragState.height, 0)
      );

      targetLayer.x = x;
      targetLayer.y = y;
      layer.style.left = `${x}px`;
      layer.style.top = `${y}px`;
      applyStackPhysics(targetLayer.id);

      const outsideDropzone = event.clientX < layerDragState.stackRect.left
        || event.clientX > layerDragState.stackRect.right
        || event.clientY < layerDragState.stackRect.top
        || event.clientY > layerDragState.stackRect.bottom;
      layer.classList.toggle('drop-active', outsideDropzone);
    });

    layer.addEventListener('pointerup', (event) => {
      if (!layerDragState || layerDragState.pointerId !== event.pointerId) return;
      const activeLayerId = layerDragState.layerId;
      const localStackRect = layerDragState.stackRect;
      layerDragState = null;
      layer.classList.remove('ingredient-layer-dragging');
      layer.classList.remove('drop-active');

      const outsideDropzone = event.clientX < localStackRect.left
        || event.clientX > localStackRect.right
        || event.clientY < localStackRect.top
        || event.clientY > localStackRect.bottom;

      const layerIndex = placedLayers.findIndex((entry) => entry.id === activeLayerId);
      if (layerIndex < 0) return;

      if (outsideDropzone) {
        const [removedLayer] = placedLayers.splice(layerIndex, 1);
        renderStack();
        setStatus(`Слой «${removedLayer.name}» удалён: ты вынес его за пределы бургера.`, 'bad');
        return;
      }

      setStatus('Слой перемещён.');
      renderStack();
    });

    layer.addEventListener('pointercancel', (event) => {
      if (!layerDragState || layerDragState.pointerId !== event.pointerId) return;
      layerDragState = null;
      layer.classList.remove('ingredient-layer-dragging');
      layer.classList.remove('drop-active');
      renderStack();
    });

    stackEl.appendChild(layer);
  });
}

function spawnFxParticle() {
  const particle = document.createElement('span');
  const symbols = ['✨', '⭐', '💥', '🎉', '🔥', '⚡', '🌟'];
  particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  particle.className = 'fx-particle';
  particle.style.left = `${20 + Math.random() * 60}%`;
  particle.style.top = `${15 + Math.random() * 65}%`;
  particle.style.setProperty('--x', `${-110 + Math.random() * 220}px`);
  particle.style.setProperty('--y', `${-150 + Math.random() * 220}px`);
  particle.style.setProperty('--rot', `${-180 + Math.random() * 360}deg`);
  particle.style.setProperty('--s', `${0.8 + Math.random() * 1.4}`);
  fxLayerEl.appendChild(particle);
  setTimeout(() => particle.remove(), 1300);
}

function showLevelCompleteOverlay() {
  overlayEl.classList.remove('overlay-visible');
  overlayEl.hidden = false;
  requestAnimationFrame(() => overlayEl.classList.add('overlay-visible'));
  celebrationBurgerEl.innerHTML = '';
  const stackSnapshot = getPlacedSnapshotForCelebration();
  stackSnapshot.forEach((item, index) => {
    const layer = createLayer(item.name);
    layer.classList.add('celebration-layer-absolute');
    layer.style.left = `${item.x}px`;
    layer.style.top = `${item.y}px`;
    layer.style.zIndex = String(100 + index);
    celebrationBurgerEl.appendChild(layer);
  });

  clearInterval(fxIntervalId);
  for (let i = 0; i < 24; i += 1) spawnFxParticle();
  fxIntervalId = setInterval(spawnFxParticle, 95);
}

function hideLevelCompleteOverlay() {
  overlayEl.classList.remove('overlay-visible');
  overlayEl.hidden = true;
  clearInterval(fxIntervalId);
  fxLayerEl.innerHTML = '';
  celebrationBurgerEl.innerHTML = '';
}

function getIngredientPhysics(name) {
  return ingredientPhysics[name] ?? { mass: 1.3, volume: 1.2, viscosity: 0.75, stickiness: 0.65 };
}

function applyStackPhysics(activeLayerId) {
  if (physicsFrameId) cancelAnimationFrame(physicsFrameId);
  physicsFrameId = requestAnimationFrame(() => {
    const active = placedLayers.find((entry) => entry.id === activeLayerId);
    if (!active) return;
    const stackRect = stackEl.getBoundingClientRect();
    const activeIndex = placedLayers.findIndex((entry) => entry.id === activeLayerId);
    if (activeIndex < 0) return;

    placedLayers.forEach((layer, index) => {
      if (layer.id === activeLayerId) return;
      const relativeIndexDistance = Math.abs(index - activeIndex);
      const activePhysics = getIngredientPhysics(active.name);
      const layerPhysics = getIngredientPhysics(layer.name);
      const coupling = ((activePhysics.stickiness + layerPhysics.stickiness) / 2) * (1 / (1 + relativeIndexDistance));
      const fluidity = (activePhysics.viscosity + layerPhysics.viscosity) / 2;
      const massRatio = activePhysics.mass / (activePhysics.mass + layerPhysics.mass);
      const targetX = active.x + (active.x - layer.x) * coupling * fluidity * massRatio * 0.2;
      const volumeLift = (activePhysics.volume - layerPhysics.volume) * 2.6;
      const targetY = active.y + (index - activeIndex) * 26 - volumeLift;
      layer.x = clamp(layer.x + (targetX - layer.x) * 0.38, 0, Math.max(stackRect.width - 220, 0));
      layer.y = clamp(layer.y + (targetY - layer.y) * 0.27, 0, Math.max(stackRect.height - 48, 0));
    });

    const orderedByY = [...placedLayers].sort((a, b) => a.y - b.y);
    placedLayers.splice(0, placedLayers.length, ...orderedByY);
    renderStack();
  });
}

function getPlacedSnapshotForCelebration() {
  if (!placedLayers.length) return [];
  const bounds = placedLayers.reduce((acc, layer) => {
    acc.minX = Math.min(acc.minX, layer.x);
    acc.maxX = Math.max(acc.maxX, layer.x);
    acc.minY = Math.min(acc.minY, layer.y);
    acc.maxY = Math.max(acc.maxY, layer.y);
    return acc;
  }, {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });
  const contentWidth = Math.max(bounds.maxX - bounds.minX + 220, 220);
  const contentHeight = Math.max(bounds.maxY - bounds.minY + 48, 120);
  const scale = Math.min(1, 240 / contentWidth, 240 / contentHeight);
  const offsetX = (240 - contentWidth * scale) / 2;
  const offsetY = (240 - contentHeight * scale) / 2;

  return [...placedLayers]
    .sort((a, b) => a.y - b.y)
    .map((layer) => ({
      name: layer.name,
      x: offsetX + (layer.x - bounds.minX) * scale,
      y: offsetY + (layer.y - bounds.minY) * scale
    }));
}

function renderIngredientTray() {
  ingredientsEl.innerHTML = '';
  shuffle(getCurrentOrder()).forEach((ingredient) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'ingredient-card';
    card.dataset.ingredient = ingredient;
    card.innerHTML = `<span class="ingredient-card-image">${ingredientSvgs[ingredient]}</span><span class="ingredient-card-label" hidden>${ingredient}</span>`;

    card.addEventListener('click', () => {
      const label = card.querySelector('.ingredient-card-label');
      if (!label) return;
      const visible = !label.hasAttribute('hidden');
      if (visible) label.setAttribute('hidden', '');
      else label.removeAttribute('hidden');
      card.classList.toggle('ingredient-card-expanded', !visible);
    });

    card.addEventListener('pointerdown', (event) => {
      if (gameLocked) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const pointerId = event.pointerId;
      const dragGhost = card.cloneNode(true);
      dragGhost.classList.add('drag-ghost');
      dragGhost.classList.remove('ingredient-card-expanded');
      dragGhost.style.left = `${event.clientX}px`;
      dragGhost.style.top = `${event.clientY}px`;
      document.body.appendChild(dragGhost);

      card.setPointerCapture(pointerId);
      dragState = {
        ingredient,
        card,
        pointerId,
        moved: false,
        dragGhost
      };

      event.preventDefault();
    });

    card.addEventListener('pointermove', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      dragState.moved = true;
      dragState.dragGhost.style.left = `${event.clientX}px`;
      dragState.dragGhost.style.top = `${event.clientY}px`;

      const rect = stackEl.getBoundingClientRect();
      const inDropzone = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      stackEl.classList.toggle('drop-active', inDropzone);
    });

    card.addEventListener('pointerup', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const localDrag = dragState;
      dragState = null;
      stackEl.classList.remove('drop-active');
      localDrag.dragGhost.remove();

      const rect = stackEl.getBoundingClientRect();
      const inDropzone = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!localDrag.moved || !inDropzone) return;

      const maxLayers = getCurrentOrder().length;
      if (placedLayers.length >= maxLayers) {
        setStatus('Все слои уже на месте. Удали лишнее или проверь.', 'bad');
        return;
      }

      const { x, y } = getSafePlacement(event.clientX, event.clientY);
      placedLayers.push({ id: nextLayerId, name: localDrag.ingredient, x, y });
      nextLayerId += 1;
      renderStack();
      setStatus('Слой добавлен в точку, где ты отпустил палец.');
    });

    card.addEventListener('pointercancel', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      dragState.dragGhost.remove();
      dragState = null;
      stackEl.classList.remove('drop-active');
    });

    ingredientsEl.appendChild(card);
  });
}

function getPlacedOrderByHeight() {
  return [...placedLayers]
    .sort((a, b) => b.y - a.y)
    .map((item) => item.name);
}

function isPlacementOrderValid() {
  const order = getCurrentOrder();
  const placedOrder = getPlacedOrderByHeight();
  return placedOrder.every((ingredient, index) => ingredient === order[index]);
}

function startLevel(levelIndex) {
  hideLevelCompleteOverlay();
  currentLevel = levelIndex;
  placedLayers.length = 0;
  gameLocked = false;
  nextLayerId = 1;
  levelInfoEl.textContent = `Уровень ${currentLevel + 1} из ${levels.length}`;
  renderReference();
  renderIngredientTray();
  renderStack();
  startTimer();
  setStatus('Перетаскивай ингредиенты в зону бургера.');
}

checkButton.addEventListener('click', () => {
  if (gameLocked) return;
  const order = getCurrentOrder();

  if (placedLayers.length !== order.length) {
    setStatus('Количество слоёв не совпадает с эталоном.', 'bad');
    return;
  }

  if (!isPlacementOrderValid()) {
    setStatus('❌ Последовательность неверная. Проверь высоту слоёв.', 'bad');
    return;
  }

  clearInterval(timerId);
  gameLocked = true;
  if (currentLevel < levels.length - 1) {
    overlayTitleEl.textContent = 'Уровень пройден';
    nextLevelButton.hidden = false;
    setStatus(`🎉 Уровень ${currentLevel + 1} пройден!`, 'ok');
    showLevelCompleteOverlay();
    return;
  }

  overlayTitleEl.textContent = '🏆 Все уровни пройдены!';
  nextLevelButton.hidden = true;
  showLevelCompleteOverlay();
  setStatus('🏆 Все уровни пройдены! Отличная сборка.', 'ok');
});

clearButton.addEventListener('click', () => {
  placedLayers.length = 0;
  gameLocked = false;
  nextLayerId = 1;
  renderStack();
  renderIngredientTray();
  startTimer();
  setStatus('Сброс: ингредиенты перемешаны, таймер перезапущен.');
});

restartLevelButton.addEventListener('click', () => {
  startLevel(currentLevel);
});

nextLevelButton.addEventListener('click', () => {
  if (currentLevel < levels.length - 1) startLevel(currentLevel + 1);
});

startLevel(0);
