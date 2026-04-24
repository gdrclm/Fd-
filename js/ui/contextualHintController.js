const HINT_MESSAGES = {
  'off-center-placement': {
    title: 'Слой уехал от центра.',
    action: 'Сдвинь верхний слой ближе к центру опоры.'
  },
  'unstable-stack': {
    title: 'Стек стал рискованным.',
    action: 'Проверь центр массы: выровняй средние слои.'
  },
  'over-compressed-bun': {
    title: 'Булка слишком смята.',
    action: 'Разгрузи низ: выровняй тяжёлые слои выше.'
  },
  'produce-slippage': {
    title: 'Овощной слой съезжает.',
    action: 'Поставь овощи на более широкую и ровную опору.'
  },
  'sauce-overflow': {
    title: 'Соус выходит за край.',
    action: 'Уменьши боковое смещение верхних слоёв.'
  },
  'poor-cheese-coverage': {
    title: 'Сыр лёг неудачно.',
    action: 'Положи сыр ровно: ему нужна стабильная опора.'
  }
};

const ISSUE_PRIORITY = {
  'unstable-stack': 100,
  'off-center-placement': 92,
  'over-compressed-bun': 85,
  'produce-slippage': 82,
  'poor-cheese-coverage': 76,
  'sauce-overflow': 70
};

function getHintText(issue) {
  const content = HINT_MESSAGES[issue.id];
  if (!content) return null;
  return `${content.title} ${content.action}`;
}

export function createContextualHintController(setStatus) {
  const seenByIssue = new Map();
  const shownTimestamps = [];
  let lastShownAt = 0;
  let lastShownIssueId = '';
  let lastStableAt = 0;

  function reset() {
    seenByIssue.clear();
    shownTimestamps.length = 0;
    lastShownAt = 0;
    lastShownIssueId = '';
    lastStableAt = 0;
  }

  function pickTopActionableIssue(buildIssues) {
    const actionable = (buildIssues?.issues ?? [])
      .filter((issue) => HINT_MESSAGES[issue.id] && issue.severity >= 0.34);

    if (!actionable.length) return null;
    return actionable.sort((a, b) => {
      const aScore = (ISSUE_PRIORITY[a.id] ?? 0) + a.severity * 10;
      const bScore = (ISSUE_PRIORITY[b.id] ?? 0) + b.severity * 10;
      return bScore - aScore;
    })[0];
  }

  function onBuildIssues(buildIssues, { now = Date.now(), gameLocked = false } = {}) {
    if (gameLocked) return;
    while (shownTimestamps.length && now - shownTimestamps[0] > 30000) shownTimestamps.shift();

    const topIssue = pickTopActionableIssue(buildIssues);
    if (!topIssue) {
      if (now - lastStableAt > 12000 && now - lastShownAt > 7000) {
        setStatus('✅ Сборка выглядит устойчиво. Продолжай в том же ритме.', 'ok');
        shownTimestamps.push(now);
        lastShownAt = now;
        lastStableAt = now;
      }
      return;
    }

    const seenCount = seenByIssue.get(topIssue.id) ?? 0;
    if (shownTimestamps.length >= 4 && topIssue.severity < 0.75) return;
    if (seenCount >= 3 && topIssue.severity < 0.5) return;

    const repeatedPenalty = Math.min(seenCount * 1300, 7200);
    const sameIssuePenalty = lastShownIssueId === topIssue.id ? 2200 : 0;
    const cooldown = 2800 + repeatedPenalty + sameIssuePenalty;

    if (now - lastShownAt < cooldown) return;
    const message = getHintText(topIssue);
    if (!message) return;

    setStatus(`💡 ${message}`, topIssue.severity >= 0.72 ? 'bad' : '');
    seenByIssue.set(topIssue.id, seenCount + 1);
    shownTimestamps.push(now);
    lastShownIssueId = topIssue.id;
    lastShownAt = now;
  }

  return {
    onBuildIssues,
    reset
  };
}
