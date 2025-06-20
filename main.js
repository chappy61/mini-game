const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const hpDisplay = document.getElementById('hpDisplay');
const guide = document.getElementById('guide');
const gameOverDisplay = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const resultScreen = document.getElementById('resultScreen');
const finalScore = document.getElementById('finalScore');
const scoreDisplay = document.getElementById('scoreDisplay');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

let playerX = gameArea.offsetWidth / 2;
let hp = 3;
let score = 0;
let isGameRunning = false;
let enemyInterval;
let bulletInterval;

// ==========================
// ゲーム開始・再開
// ==========================
document.addEventListener('keydown', (e) => {
  if (!isGameRunning && (e.key === 'Enter' || e.key === 'r')) {
    startGame();
  }
});

function startGame() {
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  isGameRunning = true;
  score = 0;
  hp = 3;
  updateHPDisplay();
  updateScoreDisplay();

  playerX = gameArea.offsetWidth / 2;
  player.style.left = `${playerX}px`;

  guide.style.display = 'block';

  enemyInterval = setInterval(spawnEnemy, 1000);
  bulletInterval = setInterval(spawnBullet, 800);
}

// ==========================
// 移動操作
// ==========================
function moveLeft() {
  const step = 20;
  playerX -= step;
  if (playerX < 0) playerX = 0;
  player.style.left = `${playerX}px`;
}

function moveRight() {
  const step = 20;
  const areaWidth = gameArea.offsetWidth;
  playerX += step;
  if (playerX > areaWidth) playerX = areaWidth;
  player.style.left = `${playerX}px`;
}

// PCキー操作
document.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  if (e.key === 'ArrowLeft') moveLeft();
  if (e.key === 'ArrowRight') moveRight();
});

// スマホタッチ操作対応
['touchstart', 'mousedown'].forEach(evt => {
  leftBtn?.addEventListener(evt, (e) => {
    if (isGameRunning) moveLeft();
  });
  rightBtn?.addEventListener(evt, (e) => {
    if (isGameRunning) moveRight();
  });
});

// ==========================
// 表示更新
// ==========================
function updateHPDisplay() {
  hpDisplay.textContent = `HP: ${hp}`;
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `SCORE: ${score}`;
}

// ==========================
// 当たり判定
// ==========================
function isColliding(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  return !(
    rectA.bottom < rectB.top ||
    rectA.top > rectB.bottom ||
    rectA.right < rectB.left ||
    rectA.left > rectB.right
  );
}

// ==========================
// 敵（▼）生成
// ==========================
function spawnEnemy() {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  enemy.textContent = '▼';
  enemy.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
  gameArea.appendChild(enemy);

  let posY = 0;
  const fall = setInterval(() => {
    posY += 4;
    enemy.style.top = posY + 'px';

    if (isColliding(enemy, player)) {
      clearInterval(fall);
      enemy.remove();
      hp--;
      updateHPDisplay();
      if (hp <= 0) triggerGameOver();
      return;
    }

    if (posY > window.innerHeight) {
      clearInterval(fall);
      enemy.remove();
    }
  }, 16);
}

// ==========================
// 弾（▲）生成
// ==========================
function spawnBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.textContent = '▲';

  const playerRect = player.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  bullet.style.left = (playerRect.left - areaRect.left) + playerRect.width / 2 - 5 + 'px';
  bullet.style.top = playerRect.top - areaRect.top - 10 + 'px';

  gameArea.appendChild(bullet);

  let posY = playerRect.top - areaRect.top - 10;
  const speed = 6;

  const move = setInterval(() => {
    posY -= speed;
    bullet.style.top = posY + 'px';

    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
      if (isColliding(bullet, enemy)) {
        enemy.remove();
        bullet.remove();
        clearInterval(move);
        score++;
        updateScoreDisplay();
      }
    });

    if (posY < 0) {
      bullet.remove();
      clearInterval(move);
    }
  }, 16);
}

// ==========================
// ゲームオーバー処理
// ==========================
function triggerGameOver() {
  isGameRunning = false;
  clearInterval(enemyInterval);
  clearInterval(bulletInterval);
  guide.style.display = 'none';
  finalScore.textContent = `SCORE: ${score}`;
  resultScreen.classList.remove('hidden');
}
