const correctOrder = [
  'Нижняя булочка',
  'Котлета',
  'Сыр',
  'Лист салата',
  'Помидор',
  'Верхняя булочка'
];

const stack = [];

const stackEl = document.getElementById('stack');
const statusEl = document.getElementById('status');
const ingredientButtons = document.querySelectorAll('[data-ingredient]');
const checkButton = document.getElementById('check');
const clearButton = document.getElementById('clear');

function renderStack() {
  stackEl.innerHTML = '';

  for (const item of stack) {
    const li = document.createElement('li');
    li.textContent = item;
    stackEl.appendChild(li);
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
    stack.push(button.dataset.ingredient);
    renderStack();

    if (!isPrefixValid()) {
      setStatus('Порядок нарушен. Можно продолжить, но уровень не засчитается.', 'bad');
      return;
    }

    if (stack.length < correctOrder.length) {
      setStatus('Хорошо! Продолжай собирать бургер.');
    } else {
      setStatus('Все ингредиенты добавлены. Нажми «Проверить».');
    }
  });
});

checkButton.addEventListener('click', () => {
  if (stack.length !== correctOrder.length) {
    setStatus('Не хватает ингредиентов. Добавь все слои бургера.', 'bad');
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
