import { levels } from '../data/levels.js';

export function setStatus(statusEl, message, tone = '') {
  statusEl.textContent = message;
  statusEl.classList.remove('ok', 'bad');
  if (tone) statusEl.classList.add(tone);
}

export function updateLevelInfo(levelInfoEl, currentLevel) {
  const level = levels[currentLevel];
  levelInfoEl.textContent = `Уровень ${currentLevel + 1} из ${levels.length} · ${level.title}`;
}
