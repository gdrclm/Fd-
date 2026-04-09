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

function createIngredientItem(name) {
  const li = document.createElement('li');
  li.className = 'stack-item';

  const icon = document.createElement('span');
  icon.className = 'ingredient-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ingredientVisuals[name] ?? '🍴';

  const label = document.createElement('span');
  label.className = 'ingredient-label';
  label.textContent = name;

  li.append(icon, label);
  return li;
}

function renderStack() {
  stackEl.innerHTML = '';

  // Показываем бургер как стопку: верхние слои визуально выше, нижняя булочка — внизу.
  const visibleStack = [...stack].reverse();

  for (const item of visibleStack) {
    stackEl.appendChild(createIngredientItem(item));
  }
}

function renderReferenceBurger() {
  referenceStackEl.innerHTML = '';

  // Эталон тоже отображаем сверху вниз для наглядного сравнения.
  for (const item of [...correctOrder].reverse()) {
    referenceStackEl.appendChild(createIngredientItem(item));
  }
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

    stack.push(button.dataset.ingredient);
    renderStack();

    if (!isPrefixValid()) {
      setStatus('Порядок нарушен. Можно продолжить, но уровень не засчитается.', 'bad');
      return;
    }

    if (stack.length < correctOrder.length) {
      setStatus('Хорошо! Продолжай собирать бургер снизу вверх.');
    } else {
      setStatus('Все ингредиенты добавлены. Нажми «Проверить».');
    }
  });
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

renderReferenceBurger();
renderStack();
