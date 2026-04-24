import { levels } from './data/levels.js';
import {
  addPlacedLayer,
  gameState,
  getCurrentLevelDefinition,
  getCurrentOrder,
  resetPlacedLayers
} from './state/gameState.js';
import { domRefs } from './ui/domRefs.js';
import { createContextualHintController } from './ui/contextualHintController.js';
import { renderReference } from './ui/referenceView.js';
import { renderIngredientTray } from './ui/trayView.js';
import {
  showLevelCompleteOverlay,
  hideLevelCompleteOverlay,
  renderScoringSummary
} from './ui/overlayView.js';
import { setStatus, updateLevelInfo } from './ui/statusView.js';
import { createRoundTimer } from './logic/timer.js';
import { getSafePlacement, renderStack } from './logic/legacyStackBridge.js';
import { initSceneBridge } from './engine/sceneBridge.js';
import { createTrayDragController } from './input/trayDragController.js';
import { calculateScoringV2, getScoreGrade } from './logic/scoringV2.js';

const setStatusText = (message, tone = '') => setStatus(domRefs.statusEl, message, tone);
const hintController = createContextualHintController(setStatusText);
const sceneBridge = initSceneBridge({
  sceneRootEl: domRefs.stackEl,
  getDebugScoring() {
    return gameState.lastScoring;
  },
  onStackAnalysis(analysis) {
    gameState.stackAnalysis = analysis;
  },
  onBuildIssues(buildIssues) {
    gameState.buildIssues = buildIssues;
    domRefs.statusEl.dataset.issueCount = String(buildIssues.issueCount);
    hintController.onBuildIssues(buildIssues, { gameLocked: gameState.gameLocked });
  }
});
gameState.sceneBridge = sceneBridge;

if (!sceneBridge.ready) {
  console.warn('[scene] bootstrap skipped:', sceneBridge.reason);
}

createTrayDragController({
  ingredientsEl: domRefs.ingredientsEl,
  stackEl: domRefs.stackEl,
  isGameLocked: () => gameState.gameLocked,
  canAddMore: () => gameState.placedLayers.length < getCurrentOrder().length,
  onDropIngredient({ ingredient, clientX, clientY }) {
    const { x, y } = getSafePlacement(domRefs.stackEl, clientX, clientY);
    addPlacedLayer({ ingredientKey: ingredient, x, y });
    renderStack({ stackEl: domRefs.stackEl, setStatus: setStatusText });
    setStatusText('Слой добавлен в точку, где ты отпустил палец.');
  },
  setStatus: setStatusText
});

const timer = createRoundTimer(domRefs.timerEl, () => {
  gameState.gameLocked = true;
  setStatusText('⌛ Время вышло. Нажми «Сбросить», чтобы попробовать снова.', 'bad');
});

function renderAllForLevel() {
  const level = getCurrentLevelDefinition();
  updateLevelInfo(domRefs.levelInfoEl, gameState.currentLevel);
  if (domRefs.hintEl) domRefs.hintEl.textContent = level.hint;
  renderReference(domRefs.referenceStackEl, getCurrentOrder());
  renderIngredientTray({
    ingredientsEl: domRefs.ingredientsEl,
    getCurrentOrder
  });
  renderStack({ stackEl: domRefs.stackEl, setStatus: setStatusText });
}

function startLevel(levelIndex) {
  hideLevelCompleteOverlay({
    overlayEl: domRefs.overlayEl,
    celebrationBurgerEl: domRefs.celebrationBurgerEl,
    fxLayerEl: domRefs.fxLayerEl,
    scoreBreakdownEl: domRefs.scoreBreakdownEl
  });

  gameState.currentLevel = levelIndex;
  gameState.gameLocked = false;
  gameState.lastScoring = null;
  hintController.reset();
  resetPlacedLayers();
  renderAllForLevel();
  timer.start(getCurrentLevelDefinition().timeLimitSeconds);
  setStatusText(`Фокус уровня: ${getCurrentLevelDefinition().focus}.`);
}

function resetCurrentLevel() {
  gameState.gameLocked = false;
  gameState.lastScoring = null;
  hintController.reset();
  resetPlacedLayers();
  renderStack({ stackEl: domRefs.stackEl, setStatus: setStatusText });
  renderIngredientTray({
    ingredientsEl: domRefs.ingredientsEl,
    getCurrentOrder
  });
  timer.start(getCurrentLevelDefinition().timeLimitSeconds);
  setStatusText('Сброс: ингредиенты перемешаны, таймер перезапущен.');
}

domRefs.checkButton.addEventListener('click', () => {
  if (gameState.gameLocked) return;
  const expectedOrder = getCurrentOrder();
  const scoring = calculateScoringV2({
    placedLayers: gameState.placedLayers,
    expectedOrder,
    entities: sceneBridge.getEntitiesSnapshot(),
    stackAnalysis: gameState.stackAnalysis,
    buildIssues: gameState.buildIssues,
    timeLeftSeconds: timer.getTimeLeft(),
    roundTimeSeconds: timer.getRoundDuration(),
    scoringEmphasis: getCurrentLevelDefinition().scoringEmphasis
  });
  gameState.lastScoring = scoring;
  timer.stop();
  gameState.gameLocked = true;
  renderScoringSummary(domRefs.scoreBreakdownEl, {
    scoring,
    buildIssues: gameState.buildIssues,
    gradeInfo: getScoreGrade(scoring.totalScore100)
  });

  if (scoring.pass && gameState.currentLevel < levels.length - 1) {
    domRefs.overlayTitleEl.textContent = `Уровень пройден · ${scoring.totalScore100}/100`;
    domRefs.nextLevelButton.hidden = false;
    setStatusText(`🎉 Уровень ${gameState.currentLevel + 1} пройден. Score: ${scoring.totalScore100}/100`, 'ok');
    showLevelCompleteOverlay({
      overlayEl: domRefs.overlayEl,
      celebrationBurgerEl: domRefs.celebrationBurgerEl,
      fxLayerEl: domRefs.fxLayerEl
    });
    return;
  }

  if (scoring.pass) {
    domRefs.overlayTitleEl.textContent = `🏆 Все уровни пройдены · ${scoring.totalScore100}/100`;
    domRefs.nextLevelButton.hidden = true;
    showLevelCompleteOverlay({
      overlayEl: domRefs.overlayEl,
      celebrationBurgerEl: domRefs.celebrationBurgerEl,
      fxLayerEl: domRefs.fxLayerEl
    });
    setStatusText(`🏆 Все уровни пройдены! Итоговый score: ${scoring.totalScore100}/100.`, 'ok');
    return;
  }

  domRefs.overlayTitleEl.textContent = `Сборка не прошла · ${scoring.totalScore100}/100`;
  domRefs.nextLevelButton.hidden = true;
  showLevelCompleteOverlay({
    overlayEl: domRefs.overlayEl,
    celebrationBurgerEl: domRefs.celebrationBurgerEl,
    fxLayerEl: domRefs.fxLayerEl
  });
  setStatusText(
    `Нужно улучшить сборку: рецепт ≥ ${Math.round(scoring.thresholds.recipePassThreshold * 100)}% и итог ≥ ${Math.round(scoring.thresholds.totalPassThreshold * 100)}%.`,
    'bad'
  );
});

domRefs.clearButton.addEventListener('click', resetCurrentLevel);
domRefs.restartLevelButton.addEventListener('click', () => startLevel(gameState.currentLevel));
domRefs.nextLevelButton.addEventListener('click', () => {
  if (gameState.currentLevel < levels.length - 1) startLevel(gameState.currentLevel + 1);
});

startLevel(0);
