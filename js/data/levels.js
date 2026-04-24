export const levels = [
  {
    id: 1,
    title: 'Базовая посадка',
    focus: 'Порядок и чтение стека',
    hint: 'Собери базовый бургер: важен порядок снизу вверх и аккуратная посадка слоёв.',
    timeLimitSeconds: 60,
    recipe: ['Нижняя булочка', 'Котлета', 'Сыр', 'Верхняя булочка']
  },
  {
    id: 2,
    title: 'Центрирование и опора',
    focus: 'Support ratio и боковые смещения',
    hint: 'Сохраняй центр. Лёгкие слои должны уверенно опираться на котлету и булку.',
    timeLimitSeconds: 58,
    scoringEmphasis: {
      alignmentScore: 1.35,
      stabilityScore: 1.2
    },
    recipe: ['Нижняя булочка', 'Котлета', 'Помидор', 'Лист салата', 'Верхняя булочка']
  },
  {
    id: 3,
    title: 'Давление и смятие булки',
    focus: 'Нагрузка сверху и bun compression',
    hint: 'Укладывай тяжёлые слои ровно: перегруз нижней булки резко снижает качество.',
    timeLimitSeconds: 55,
    scoringEmphasis: {
      materialScore: 1.3,
      stabilityScore: 1.15
    },
    recipe: ['Нижняя булочка', 'Котлета', 'Бекон', 'Грибы', 'Сыр', 'Верхняя булочка']
  },
  {
    id: 4,
    title: 'Мягкие слои',
    focus: 'Cheese/produce behavior',
    hint: 'Сыр должен покрывать опору, produce — не уезжать вбок. Работай мягко и точно.',
    timeLimitSeconds: 52,
    scoringEmphasis: {
      materialScore: 1.4,
      alignmentScore: 1.15
    },
    recipe: ['Нижняя булочка', 'Котлета', 'Сыр', 'Лист салата', 'Огурец', 'Помидор', 'Лук', 'Верхняя булочка']
  },
  {
    id: 5,
    title: 'Mastery assembly',
    focus: 'Полный tactile контроль',
    hint: 'Финальная проверка: держи рецепт, устойчивость и аккуратную подачу одновременно.',
    timeLimitSeconds: 50,
    scoringEmphasis: {
      recipeScore: 1.2,
      alignmentScore: 1.1,
      materialScore: 1.15,
      presentationScore: 1.1
    },
    recipe: ['Нижняя булочка', 'Котлета', 'Грибы', 'Сыр', 'Бекон', 'Соус', 'Лист салата', 'Помидор', 'Огурец', 'Лук', 'Верхняя булочка']
  }
];
