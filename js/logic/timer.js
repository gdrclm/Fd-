import { ROUND_TIME_SECONDS } from '../config/gameConfig.js';

export function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `⏱ ${mm}:${ss}`;
}

export function createRoundTimer(timerEl, onTimeExpired) {
  let timeLeft = ROUND_TIME_SECONDS;
  let roundDuration = ROUND_TIME_SECONDS;
  let timerId = null;

  function stop() {
    clearInterval(timerId);
    timerId = null;
  }

  function start(nextDurationSeconds = ROUND_TIME_SECONDS) {
    stop();
    roundDuration = Math.max(10, Math.floor(nextDurationSeconds));
    timeLeft = roundDuration;
    timerEl.textContent = formatTime(timeLeft);

    timerId = setInterval(() => {
      timeLeft -= 1;
      timerEl.textContent = formatTime(Math.max(timeLeft, 0));
      if (timeLeft <= 0) {
        stop();
        onTimeExpired();
      }
    }, 1000);
  }

  return {
    start,
    stop,
    getTimeLeft: () => timeLeft,
    getRoundDuration: () => roundDuration
  };
}
