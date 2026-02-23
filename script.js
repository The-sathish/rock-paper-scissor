
const EMOJIS  = { rock: '🪨', paper: '📄', scissors: '✂️' };
const CHOICES = ['rock', 'paper', 'scissors'];

const BEATS = {
  rock:     'scissors',
  scissors: 'paper',
  paper:    'rock'
};


let playerScore  = 0;
let cpuScore     = 0;
let round        = 1;     
let roundsPlayed = 0;     
let isAnimating  = false; 


const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}


function playTone(freq, type, duration, vol = 0.15) {
  try {
    if (!audioCtx) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
  }
}

function playSelectSound() {
  initAudio();
  playTone(440, 'sine', 0.08, 0.1);
  setTimeout(() => playTone(660, 'sine', 0.08, 0.08), 60);
}

function playWinSound() {
  initAudio();
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playTone(f, 'triangle', 0.2, 0.15), i * 80)
  );
}

function playLoseSound() {
  initAudio();
  [300, 250, 200].forEach((f, i) =>
    setTimeout(() => playTone(f, 'sawtooth', 0.2, 0.1), i * 80)
  );
}

function playTieSound() {
  initAudio();
  playTone(350, 'square', 0.15, 0.1);
}


function play(playerPick) {
  if (isAnimating) return; 
  isAnimating = true;

  playSelectSound();

  setButtonsDisabled(true);

  const playerChoiceEl = document.getElementById('playerChoice');
  playerChoiceEl.textContent = EMOJIS[playerPick];
  playerChoiceEl.classList.remove('glow-win', 'glow-lose');

  const cpuChoiceEl = document.getElementById('cpuChoice');
  cpuChoiceEl.innerHTML = '<span class="thinking">🤔</span>';
  cpuChoiceEl.classList.remove('glow-win', 'glow-lose');

  showResult('', '');

  setTimeout(() => {
    const cpuPick = CHOICES[Math.floor(Math.random() * 3)];
    cpuChoiceEl.textContent = EMOJIS[cpuPick];

    const outcome = getOutcome(playerPick, cpuPick);
    processOutcome(outcome, playerChoiceEl, cpuChoiceEl);

    setTimeout(() => {
      setButtonsDisabled(false);
      isAnimating = false;
    }, 1000);

  }, 700);
}


function getOutcome(player, cpu) {
  if (player === cpu)         return 'tie';
  if (BEATS[player] === cpu)  return 'win';
  return 'lose';
}


function processOutcome(outcome, playerEl, cpuEl) {
  if (outcome === 'win') {
    playerScore++;
    playerEl.classList.add('glow-win');
    cpuEl.classList.add('glow-lose');
    showResult('⚡ YOU WIN THIS ROUND!', 'win');
    animateScore('playerScore');
    playWinSound();
    roundsPlayed++;
    setPip(roundsPlayed, 'player-win');

  } else if (outcome === 'lose') {
    cpuScore++;
    cpuEl.classList.add('glow-win');
    playerEl.classList.add('glow-lose');
    showResult('💀 CPU WINS THIS ROUND', 'lose');
    animateScore('cpuScore');
    playLoseSound();
    roundsPlayed++;
    setPip(roundsPlayed, 'computer-win');

  } else {
    showResult('🔄 TIE — NO POINT', 'tie');
    playTieSound();
  }

  updateScoreDisplay();

  if (playerScore === 2 || cpuScore === 2) {
    setTimeout(() => showWinnerScreen(), 900);
  } else {
    if (outcome !== 'tie') round++;
    updateRoundDisplay();
  }
}


function updateScoreDisplay() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('cpuScore').textContent    = cpuScore;
}

function updateRoundDisplay() {
  const labels = ['', 'ROUND 1', 'ROUND 2', 'ROUND 3'];
  document.getElementById('roundText').textContent =
    labels[Math.min(round, 3)] || 'FINAL ROUND';
}


function showResult(text, type) {
  const el = document.getElementById('resultText');
  el.className = 'result-text';
  el.textContent = text;
  void el.offsetWidth; 
  if (text) {
    el.classList.add('show', type);
  }
}

function animateScore(id) {
  const el = document.getElementById(id);
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.toggle('disabled', disabled);
  });
}


function setPip(index, cls) {
  const pip = document.getElementById(`pip${index}`);
  if (pip) pip.classList.add(cls);
}


function showWinnerScreen() {
  const playerWon = playerScore > cpuScore;

  const titleEl    = document.getElementById('winnerTitle');
  const subtitleEl = document.getElementById('winnerSubtitle');
  const trophyEl   = document.getElementById('winnerTrophy');

  document.getElementById('finalPlayerScore').textContent = playerScore;
  document.getElementById('finalCPUScore').textContent    = cpuScore;

  if (playerWon) {
    titleEl.textContent   = 'VICTORY!';
    titleEl.className     = 'winner-title player-wins';
    subtitleEl.textContent = 'You conquered the Cyber Arena';
    trophyEl.textContent  = '🏆';
    launchConfetti();
  } else {
    titleEl.textContent   = 'DEFEATED';
    titleEl.className     = 'winner-title computer-wins';
    subtitleEl.textContent = 'The CPU reigns supreme';
    trophyEl.textContent  = '💀';
  }

  document.getElementById('winnerScreen').classList.add('active');
}


function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  const colors    = ['#00f5ff', '#ff006e', '#39ff14', '#ffe600', '#a855f7', '#ff8c00'];
  const count     = 80;

  for (let i = 0; i < count; i++) {
    const piece    = document.createElement('div');
    piece.className = 'confetti-piece';

    const left     = Math.random() * 100;
    const delay    = Math.random() * 2;
    const duration = 2.5 + Math.random() * 2;
    const drift    = (Math.random() - 0.5) * 200;
    const size     = 6 + Math.random() * 8;
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const shape    = Math.random() > 0.5 ? '50%' : '2px';

    piece.style.cssText = `
      left: ${left}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${shape};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
      box-shadow: 0 0 6px ${color};
    `;

    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 6000);
}



function resetGame() {
  playerScore  = 0;
  cpuScore     = 0;
  round        = 1;
  roundsPlayed = 0;
  isAnimating  = false;

  updateScoreDisplay();
  updateRoundDisplay();
  showResult('', '');

  const playerChoiceEl = document.getElementById('playerChoice');
  const cpuChoiceEl    = document.getElementById('cpuChoice');
  playerChoiceEl.textContent = '❓';
  cpuChoiceEl.textContent    = '❓';
  playerChoiceEl.className   = 'battle-choice';
  cpuChoiceEl.className      = 'battle-choice';

  ['pip1', 'pip2', 'pip3'].forEach(id => {
    document.getElementById(id).className = 'pip';
  });

  document.getElementById('winnerScreen').classList.remove('active');
  document.getElementById('confettiContainer').innerHTML = '';

  setButtonsDisabled(false);
}


updateRoundDisplay();
