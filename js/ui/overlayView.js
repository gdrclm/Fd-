import { gameState } from '../state/gameState.js';
import { createLayer, getPlacedSnapshotForCelebration } from '../logic/legacyStackBridge.js';

function spawnFxParticle(fxLayerEl) {
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

const SCORE_LABELS = {
  recipeScore: 'Рецепт',
  alignmentScore: 'Выравнивание',
  stabilityScore: 'Устойчивость',
  materialScore: 'Материалы',
  presentationScore: 'Подача',
  timeScore: 'Темп'
};

function formatPct(value) {
  return `${Math.round(value * 100)}%`;
}

function getTopStrengths(scoring) {
  return Object.entries(scoring.subscores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, score]) => score >= 0.72)
    .map(([key, score]) => `Сильная сторона: ${SCORE_LABELS[key]} (${formatPct(score)})`);
}

function getTopIssues(buildIssues) {
  return (buildIssues?.issues ?? [])
    .slice(0, 2)
    .map((issue) => `Риск: ${issue.playerFacingLabel}`);
}

export function renderScoringSummary(scoreBreakdownEl, { scoring, buildIssues, gradeInfo }) {
  if (!scoreBreakdownEl) return;
  scoreBreakdownEl.innerHTML = '';

  const headline = document.createElement('div');
  headline.className = 'score-headline';
  headline.innerHTML = `
    <div class="score-total">
      <span class="score-total-value">${scoring.totalScore100}</span>
      <span class="score-total-label">из 100</span>
    </div>
    <div class="score-grade-badge">
      <span class="score-grade-letter">${gradeInfo.grade}</span>
      <span class="score-grade-text">${gradeInfo.label}</span>
    </div>
  `;
  scoreBreakdownEl.appendChild(headline);

  const bars = document.createElement('div');
  bars.className = 'score-bars';
  Object.entries(scoring.subscores).forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'score-bar-row';
    row.innerHTML = `
      <div class="score-bar-caption">
        <span>${SCORE_LABELS[key] ?? key}</span>
        <span>${formatPct(value)}</span>
      </div>
      <div class="score-bar-track">
        <span class="score-bar-fill" style="--bar:${Math.round(value * 100)}%"></span>
      </div>
    `;
    bars.appendChild(row);
  });
  scoreBreakdownEl.appendChild(bars);

  const insights = document.createElement('div');
  insights.className = 'score-insights';
  const strengths = getTopStrengths(scoring);
  const issues = getTopIssues(buildIssues);
  [...strengths, ...issues].slice(0, 4).forEach((text) => {
    const item = document.createElement('p');
    item.className = 'score-insight-item';
    item.textContent = text;
    insights.appendChild(item);
  });
  if (!insights.childElementCount) {
    const item = document.createElement('p');
    item.className = 'score-insight-item';
    item.textContent = 'Сборка без заметных проблем — отличный баланс.';
    insights.appendChild(item);
  }
  scoreBreakdownEl.appendChild(insights);
}

export function showLevelCompleteOverlay({
  overlayEl,
  celebrationBurgerEl,
  fxLayerEl
}) {
  overlayEl.classList.remove('overlay-visible');
  overlayEl.hidden = false;
  requestAnimationFrame(() => overlayEl.classList.add('overlay-visible'));

  celebrationBurgerEl.innerHTML = '';
  const snapshot = getPlacedSnapshotForCelebration(gameState.placedLayers);
  snapshot.forEach((item, index) => {
    const layer = createLayer(item.name);
    layer.classList.add('celebration-layer-absolute');
    layer.style.left = `${item.x}px`;
    layer.style.top = `${item.y}px`;
    layer.style.zIndex = String(100 + index);
    celebrationBurgerEl.appendChild(layer);
  });

  clearInterval(gameState.fxIntervalId);
  for (let i = 0; i < 24; i += 1) spawnFxParticle(fxLayerEl);
  gameState.fxIntervalId = setInterval(() => spawnFxParticle(fxLayerEl), 95);
}

export function hideLevelCompleteOverlay({
  overlayEl,
  celebrationBurgerEl,
  fxLayerEl,
  scoreBreakdownEl
}) {
  overlayEl.classList.remove('overlay-visible');
  overlayEl.hidden = true;
  clearInterval(gameState.fxIntervalId);
  fxLayerEl.innerHTML = '';
  celebrationBurgerEl.innerHTML = '';
  if (scoreBreakdownEl) scoreBreakdownEl.innerHTML = '';
}
