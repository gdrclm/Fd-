const ingredientSvgs = {
  'Нижняя булочка': `
    <svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="14" width="200" height="44" rx="20" fill="#d99a4e"/>
      <rect x="10" y="10" width="200" height="30" rx="15" fill="#e9b165"/>
    </svg>
  `,
  'Котлета': `
    <svg viewBox="0 0 220 55" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 17 C38 6, 182 6, 212 17 L212 39 C182 49, 38 49, 8 39 Z" fill="#653325"/>
      <path d="M20 24 C52 18, 168 18, 200 24" stroke="#7f4231" stroke-width="4" fill="none"/>
    </svg>
  `,
  'Сыр': `
    <svg viewBox="0 0 220 54" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 16 L206 16 L186 42 L34 42 Z" fill="#f7c63d"/>
      <circle cx="64" cy="28" r="4" fill="#edb52d"/>
      <circle cx="118" cy="25" r="3.5" fill="#edb52d"/>
      <circle cx="160" cy="32" r="4.5" fill="#edb52d"/>
    </svg>
  `,
  'Лист салата': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 36 C20 12, 40 44, 56 24 C72 8, 88 42, 104 22 C120 8, 138 44, 154 24 C170 8, 190 42, 212 18 L212 42 L8 42 Z" fill="#47b34e"/>
      <path d="M24 35 C52 22, 168 22, 196 35" stroke="#31863a" stroke-width="3" fill="none"/>
    </svg>
  `,
  'Помидор': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="58" cy="26" rx="42" ry="12" fill="#e64d3d"/>
      <ellipse cx="110" cy="26" rx="42" ry="12" fill="#ee5b4a"/>
      <ellipse cx="162" cy="26" rx="42" ry="12" fill="#e64d3d"/>
      <circle cx="58" cy="26" r="2.5" fill="#f9b9b1"/>
      <circle cx="110" cy="26" r="2.5" fill="#f9b9b1"/>
      <circle cx="162" cy="26" r="2.5" fill="#f9b9b1"/>
    </svg>
  `,
  'Верхняя булочка': `
    <svg viewBox="0 0 220 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 70 C10 26, 50 10, 110 10 C170 10, 210 26, 210 70 Z" fill="#e8ad62"/>
      <path d="M10 70 C10 34, 48 20, 110 20 C172 20, 210 34, 210 70" fill="#f0bc72"/>
      <ellipse cx="74" cy="40" rx="5" ry="2.8" fill="#fff7df"/>
      <ellipse cx="97" cy="30" rx="5" ry="2.8" fill="#fff7df"/>
      <ellipse cx="121" cy="38" rx="5" ry="2.8" fill="#fff7df"/>
      <ellipse cx="147" cy="31" rx="5" ry="2.8" fill="#fff7df"/>
      <ellipse cx="165" cy="43" rx="5" ry="2.8" fill="#fff7df"/>
    </svg>
  `,
  'Бекон': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 35 C35 10, 70 43, 105 19 C140 3, 172 31, 210 12 L210 37 C170 50, 140 22, 105 37 C70 51, 35 22, 10 45 Z" fill="#c14337"/>
      <path d="M20 35 C45 18, 70 45, 105 25 C140 12, 170 35, 198 18" stroke="#f4b08f" stroke-width="6" fill="none"/>
    </svg>
  `,
  'Лук': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="72" cy="26" rx="46" ry="13" fill="none" stroke="#caa9f8" stroke-width="8"/>
      <ellipse cx="148" cy="26" rx="46" ry="13" fill="none" stroke="#b08bec" stroke-width="8"/>
    </svg>
  `,
  'Огурец': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="62" cy="26" r="16" fill="#6fc157"/>
      <circle cx="110" cy="26" r="16" fill="#71c75a"/>
      <circle cx="158" cy="26" r="16" fill="#6fc157"/>
      <circle cx="62" cy="26" r="8" fill="#98df7f"/>
      <circle cx="110" cy="26" r="8" fill="#9ae486"/>
      <circle cx="158" cy="26" r="8" fill="#98df7f"/>
    </svg>
  `,
  'Грибы': `
    <svg viewBox="0 0 220 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M40 30 C40 18, 58 12, 74 12 C90 12, 108 18, 108 30 Z" fill="#d7bea2"/>
      <rect x="66" y="30" width="16" height="16" rx="6" fill="#f2e1cc"/>
      <path d="M112 30 C112 18, 130 12, 146 12 C162 12, 180 18, 180 30 Z" fill="#cdb294"/>
      <rect x="138" y="30" width="16" height="16" rx="6" fill="#ead7c0"/>
    </svg>
  `,
  'Соус': `
    <svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 24 C34 8, 54 40, 76 24 C98 8, 120 40, 142 24 C164 8, 186 40, 208 24" stroke="#f39a30" stroke-width="10" fill="none" stroke-linecap="round"/>
    </svg>
  `
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

const stackEl = document.getElementById('stack');
const referenceStackEl = document.getElementById('reference-stack');
const statusEl = document.getElementById('status');
const levelInfoEl = document.getElementById('level-info');
const ingredientsEl = document.getElementById('ingredients');
const checkButton = document.getElementById('check');
const clearButton = document.getElementById('clear');

function getCurrentOrder() {
  return levels[currentLevel];
}

function shuffle(array) {
  const clone = [...array];

  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }

  return clone;
}

function createIngredientLayer(name, interactive = false, onClick = null) {
  const layer = document.createElement('button');
  layer.type = 'button';
  layer.className = 'ingredient-layer';
  layer.innerHTML = ingredientSvgs[name] ?? ingredientSvgs['Нижняя булочка'];

  if (interactive && typeof onClick === 'function') {
    layer.classList.add('ingredient-layer-clickable');
    layer.title = `Удалить: ${name}`;
    layer.addEventListener('click', onClick);
  }

  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = interactive ? `${name}. Нажми, чтобы удалить.` : name;
  layer.appendChild(label);

  return layer;
}

function renderBurger(container, ingredients, interactive = false) {
  container.innerHTML = '';

  ingredients.forEach((ingredient, index) => {
    const onClick = interactive
      ? () => {
          const removed = stack.splice(index, 1)[0];
          renderStack();
          setStatus(`Удален слой: ${removed}. Продолжай сборку.`);
        }
      : null;

    container.appendChild(createIngredientLayer(ingredient, interactive, onClick));
  });
}

function renderStack() {
  renderBurger(stackEl, stack, true);
}

function renderReferenceBurger() {
  renderBurger(referenceStackEl, getCurrentOrder(), false);
}

function renderIngredientButtons() {
  const levelIngredients = shuffle(getCurrentOrder());
  ingredientsEl.innerHTML = '';

  levelIngredients.forEach((ingredientName) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.ingredient = ingredientName;

    const icon = document.createElement('span');
    icon.className = 'button-icon';
    icon.innerHTML = ingredientSvgs[ingredientName] ?? '';

    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = ingredientName;

    button.append(icon, label);

    button.addEventListener('click', () => {
      const correctOrder = getCurrentOrder();

      if (stack.length >= correctOrder.length) {
        setStatus('Все слои уже добавлены. Нажми «Проверить» или «Сбросить».', 'bad');
        return;
      }

      stack.push(ingredientName);
      renderStack();

      if (!isPrefixValid()) {
        setStatus('Порядок нарушен. Можно продолжить, но уровень не засчитается.', 'bad');
        return;
      }

      if (stack.length < correctOrder.length) {
        setStatus('Отлично! Продолжай собирать бургер слой за слоем.');
      } else {
        setStatus('Все ингредиенты добавлены. Нажми «Проверить».');
      }
    });

    ingredientsEl.appendChild(button);
  });
}

function setStatus(message, tone = '') {
  statusEl.textContent = message;
  statusEl.classList.remove('ok', 'bad');

  if (tone) {
    statusEl.classList.add(tone);
  }
}

function isPrefixValid() {
  const correctOrder = getCurrentOrder();
  return stack.every((ingredient, index) => ingredient === correctOrder[index]);
}

function startLevel(levelNumber) {
  currentLevel = levelNumber;
  stack.length = 0;
  levelInfoEl.textContent = `Уровень ${currentLevel + 1} из ${levels.length}`;
  renderReferenceBurger();
  renderIngredientButtons();
  renderStack();
  setStatus('Новый уровень! Начни с нижней булочки.');
}

stackEl.addEventListener('click', (event) => {
  const layer = event.target.closest('.ingredient-layer-clickable');

  if (!layer) {
    return;
  }

  const index = Number(layer.dataset.stackIndex);

  if (Number.isNaN(index) || index < 0 || index >= stack.length) {
    setStatus('Не удалось удалить слой. Попробуй снова.', 'bad');
    return;
  }

  const removed = stack.splice(index, 1)[0];
  renderStack();
  setStatus(`Удален слой: ${removed}. Продолжай сборку.`);
});

checkButton.addEventListener('click', () => {
  const correctOrder = getCurrentOrder();

  if (stack.length < correctOrder.length) {
    setStatus('Не хватает ингредиентов. Добавь все слои бургера.', 'bad');
    return;
  }

  if (stack.length > correctOrder.length) {
    setStatus('Добавлены лишние слои. Нажми «Сбросить» и собери заново.', 'bad');
    return;
  }

  if (!isPrefixValid()) {
    setStatus('❌ Неправильная последовательность. Попробуй снова.', 'bad');
    return;
  }

  if (currentLevel < levels.length - 1) {
    setStatus(`🎉 Уровень ${currentLevel + 1} пройден! Переход на следующий...`, 'ok');
    setTimeout(() => startLevel(currentLevel + 1), 900);
    return;
  }

  setStatus('🏆 Поздравляем! Ты прошел все уровни.', 'ok');
});

clearButton.addEventListener('click', () => {
  stack.length = 0;
  renderStack();
  renderIngredientButtons();
  setStatus('Сброс выполнен. Ингредиенты перемешаны — начни заново.');
});

startLevel(0);
