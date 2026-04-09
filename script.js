const correctOrder = [
  'Нижняя булочка',
  'Котлета',
  'Сыр',
  'Лист салата',
  'Помидор',
  'Верхняя булочка'
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

const stackEl = document.getElementById('stack');
const referenceStackEl = document.getElementById('reference-stack');
const statusEl = document.getElementById('status');
const ingredientButtons = document.querySelectorAll('[data-ingredient]');
const checkButton = document.getElementById('check');
const clearButton = document.getElementById('clear');

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
  `
};

function createIngredientLayer(name, stackIndex = null, interactive = false) {
  const layer = document.createElement('button');
  layer.type = 'button';
  layer.className = 'ingredient-layer';
  layer.innerHTML = ingredientSvgs[name] ?? ingredientSvgs['Нижняя булочка'];

  if (interactive) {
    layer.classList.add('ingredient-layer-clickable');
    layer.dataset.stackIndex = String(stackIndex);
    layer.title = `Удалить: ${name}`;
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
    container.appendChild(createIngredientLayer(ingredient, index, interactive));
  });
}

function renderStack() {
  renderBurger(stackEl, stack, true);
}

function renderReferenceBurger() {
  renderBurger(referenceStackEl, correctOrder, false);
}

function decorateIngredientButtons() {
  ingredientButtons.forEach((button) => {
    const ingredientName = button.dataset.ingredient;
    const icon = document.createElement('span');
    icon.className = 'button-icon';
    icon.innerHTML = ingredientSvgs[ingredientName] ?? '';

    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = ingredientName;

    button.textContent = '';
    button.append(icon, label);
  });
}

function renderStack() {
  renderBurger(stackEl, stack);
}

function renderReferenceBurger() {
  renderBurger(referenceStackEl, correctOrder);
}

function setStatus(message, tone = '') {
  statusEl.textContent = message;
  statusEl.classList.remove('ok', 'bad');

  if (tone) {
    statusEl.classList.add(tone);
  }
}

function isPrefixValid() {
  return stack.every((ingredient, index) => ingredient === correctOrder[index]);
}

ingredientButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (stack.length >= correctOrder.length) {
      setStatus('Все слои уже добавлены. Нажми «Проверить» или «Сбросить».', 'bad');
      return;
    }

    const ingredientName = button.dataset.ingredient;

    if (!ingredientSvgs[ingredientName]) {
      setStatus('Не удалось добавить ингредиент: неизвестный слой.', 'bad');
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
});

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
  if (stack.length < correctOrder.length) {
    setStatus('Не хватает ингредиентов. Добавь все слои бургера.', 'bad');
    return;
  }

  if (stack.length > correctOrder.length) {
    setStatus('Добавлены лишние слои. Нажми «Сбросить» и собери заново.', 'bad');
    return;
  }

  if (isPrefixValid()) {
    setStatus('🎉 Уровень пройден! Бургер собран идеально.', 'ok');
  } else {
    setStatus('❌ Неправильная последовательность. Попробуй снова.', 'bad');
  }
});

clearButton.addEventListener('click', () => {
  stack.length = 0;
  renderStack();
  setStatus('Сброс выполнен. Начни с нижней булочки.');
});

decorateIngredientButtons();
renderReferenceBurger();
renderStack();
