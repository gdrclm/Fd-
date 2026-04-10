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

const ingredientVisuals = {
  'Нижняя булочка': '🥯',
  'Котлета': '🥩',
  'Сыр': '🧀',
  'Лист салата': '🥬',
  'Помидор': '🍅',
  'Верхняя булочка': '🍞'
};

const stack = [];
let currentLevel = 0;
let timeLeft = ROUND_TIME_SECONDS;
let timerId = null;
let gameLocked = false;

const stackEl = document.getElementById('stack');
const referenceStackEl = document.getElementById('reference-stack');
const statusEl = document.getElementById('status');
const levelInfoEl = document.getElementById('level-info');
const timerEl = document.getElementById('timer');
const ingredientsEl = document.getElementById('ingredients');
const checkButton = document.getElementById('check');
const clearButton = document.getElementById('clear');

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

function getVisualLayers(ingredients) {
  return [...ingredients].reverse();
}

function createLayer(name, logicalIndex = null, interactive = false) {
  const layer = document.createElement('button');
  layer.type = 'button';
  layer.className = 'ingredient-layer';
  layer.innerHTML = ingredientSvgs[name] ?? ingredientSvgs['Нижняя булочка'];

  if (interactive) {
    layer.classList.add('ingredient-layer-clickable');
    layer.title = `Удалить: ${name}`;
    layer.addEventListener('click', () => {
      if (gameLocked) return;
      stack.splice(logicalIndex, 1);
      renderStack();
      setStatus(`Удален слой: ${name}.`);
    });
  }

  return layer;
}

function renderBurger(container, ingredients, interactive = false) {
  container.innerHTML = '';
  const visual = getVisualLayers(ingredients);

  visual.forEach((ingredient, visualIndex) => {
    const logicalIndex = ingredients.length - 1 - visualIndex;
    container.appendChild(createLayer(ingredient, logicalIndex, interactive));
  });
}

function renderStack() { renderBurger(stackEl, stack, true); }
function renderReference() { renderBurger(referenceStackEl, getCurrentOrder(), false); }

function renderIngredientTray() {
  ingredientsEl.innerHTML = '';
  shuffle(getCurrentOrder()).forEach((ingredient) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'ingredient-card';
    card.draggable = true;
    card.dataset.ingredient = ingredient;
    card.innerHTML = `<span class="ingredient-card-image">${ingredientSvgs[ingredient]}</span><span class="ingredient-card-label">${ingredient}</span>`;

    card.addEventListener('dragstart', (event) => {
      if (gameLocked) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData('text/plain', ingredient);
      event.dataTransfer.effectAllowed = 'copy';
    });

    ingredientsEl.appendChild(card);
  });
}

function getInsertIndexFromDrop(clientY) {
  const layerEls = [...stackEl.querySelectorAll('.ingredient-layer')]; // top -> bottom

  if (layerEls.length === 0) return 0;

  for (let i = 0; i < layerEls.length; i += 1) {
    const rect = layerEls[i].getBoundingClientRect();
    const middle = rect.top + rect.height / 2;

    if (clientY < middle) {
      return stack.length - i;
    }
  }

  return 0;
}

function isPrefixValid() {
  const order = getCurrentOrder();
  return stack.every((ing, i) => ing === order[i]);
}

function startLevel(levelIndex) {
  currentLevel = levelIndex;
  stack.length = 0;
  gameLocked = false;
  levelInfoEl.textContent = `Уровень ${currentLevel + 1} из ${levels.length}`;
  renderReference();
  renderIngredientTray();
  renderStack();
  startTimer();
  setStatus('Перетаскивай ингредиенты в зону бургера.');
}

stackEl.addEventListener('dragover', (event) => {
  if (gameLocked) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  stackEl.classList.add('drop-active');
});

stackEl.addEventListener('dragleave', () => {
  stackEl.classList.remove('drop-active');
});

stackEl.addEventListener('drop', (event) => {
  event.preventDefault();
  stackEl.classList.remove('drop-active');

  if (gameLocked) return;

  const ingredient = event.dataTransfer.getData('text/plain');
  if (!ingredientSvgs[ingredient]) return;

  const maxLayers = getCurrentOrder().length;
  if (stack.length >= maxLayers) {
    setStatus('Все слои уже на месте. Удали лишнее или проверь.', 'bad');
    return;
  }

  const insertAt = getInsertIndexFromDrop(event.clientY);
  stack.splice(insertAt, 0, ingredient);
  renderStack();
  setStatus('Слой добавлен. Продолжай сборку.');
});

checkButton.addEventListener('click', () => {
  if (gameLocked) return;
  const order = getCurrentOrder();

  if (stack.length !== order.length) {
    setStatus('Количество слоёв не совпадает с эталоном.', 'bad');
    return;
  }

  if (!isPrefixValid()) {
    setStatus('❌ Последовательность неверная. Перетасуй слои заново.', 'bad');
    return;
  }

  clearInterval(timerId);
  if (currentLevel < levels.length - 1) {
    setStatus(`🎉 Уровень ${currentLevel + 1} пройден!`, 'ok');
    setTimeout(() => startLevel(currentLevel + 1), 700);
    return;
  }

  gameLocked = true;
  setStatus('🏆 Все уровни пройдены! Отличная сборка.', 'ok');
});

clearButton.addEventListener('click', () => {
  stack.length = 0;
  gameLocked = false;
  renderStack();
  renderIngredientTray();
  startTimer();
  setStatus('Сброс: ингредиенты перемешаны, таймер перезапущен.');
});

startLevel(0);
