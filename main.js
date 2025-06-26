/* 要素の取得 */
const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const hpDisplay = document.getElementById('hpDisplay');
const guide = document.getElementById('guide');
const gameOverDisplay = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const resultScreen = document.getElementById('resultScreen');
const finalScore = document.getElementById('finalScore');
const scoreDisplay = document.getElementById('scoreDisplay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

/* ゲームの状態管理 */
let playerX = gameArea.offsetWidth / 2;
let hp = 3;
let score = 0;
let isGameRunning = false;
let enemyInterval;
let bulletInterval;
const bullets = [];

/* ゲーム開始処理 */
function startGame() {
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameOverDisplay.style.display = 'none';

  isGameRunning = true;
  score = 0;
  hp = 3;
  updateHPDisplay();
  updateScoreDisplay();

  playerX = gameArea.offsetWidth / 2;
  player.style.left = `${playerX}px`;

  guide.style.display = 'block';

  // 敵と弾の生成開始
  enemyInterval = setInterval(spawnEnemy, 1000);
  bulletInterval = setInterval(spawnBullet, 800);
}

/* スタートボタンとリスタートボタンのイベントリスナー */
startBtn?.addEventListener('click', () => {
  if (!isGameRunning) {
    startGame();
  }
});

restartBtn?.addEventListener('click', () => {
  if (!isGameRunning) {
    startGame();
  }
});

/* Enterキーおよびrキーでゲーム開始/リスタート */
document.addEventListener('keydown', (e) => {
  if (!isGameRunning && (e.key === 'Enter' || e.key === 'r')) {
    startGame();
  }
});

/* プレイヤーの移動処理 */
function handleMovement(e) {
  const step = 20;
  const areaWidth = gameArea.offsetWidth;

  if (e.key === 'ArrowLeft') playerX -= step;
  if (e.key === 'ArrowRight') playerX += step;

  // 移動範囲の制限
  if (playerX < 0) playerX = 0;
  if (playerX > areaWidth) playerX = areaWidth;

  player.style.left = `${playerX}px`;
}

document.addEventListener('keydown', (e) => {
  if (isGameRunning) {
    handleMovement(e);
  }
});

/* HP表示の更新 */
function updateHPDisplay() {
  hpDisplay.textContent = `HP: ${hp}`;
}
updateHPDisplay();

/* スコア表示の更新 */
function updateScoreDisplay() {
  scoreDisplay.textContent = `SCORE: ${score}`;
}

/* 当たり判定 */
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

/* 敵（▼）の生成と移動 */
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

    // 敵とプレイヤーの当たり判定
    if (isColliding(enemy, player)) {
      clearInterval(fall);
      enemy.remove();
      hp--;
      updateHPDisplay();
      console.log(`>>> HIT DETECTED - HP: ${hp}`);
      if (hp <= 0) {
        console.log(">>> PROCESS TERMINATED");
        triggerGameOver();
      }
      return;
    }

    // 画面外に出たら削除
    if (posY > window.innerHeight) {
      clearInterval(fall);
      enemy.remove();
    }
  }, 16);
}

/* 弾（▲）の生成と移動 */
function spawnBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.textContent = '▲';

  const playerRect = player.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  bullet.style.left = (playerRect.left - areaRect.left) + playerRect.width / 2 - 5 + 'px';
  bullet.style.top = playerRect.top - areaRect.top - 10 + 'px';

  gameArea.appendChild(bullet);
  bullets.push(bullet);

  let posY = playerRect.top - areaRect.top - 10;
  const speed = 6;

  const move = setInterval(() => {
    posY -= speed;
    bullet.style.top = posY + 'px';

    // 弾と敵の当たり判定
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

    // 画面外に出たら削除
    if (posY < 0) {
      bullet.remove();
      clearInterval(move);
    }
  }, 16);
}

/* ゲームオーバー処理 */
function triggerGameOver() {
  isGameRunning = false;
  clearInterval(enemyInterval);
  clearInterval(bulletInterval);
  guide.style.display = 'none';
  finalScore.textContent = `SCORE: ${score}`;
  resultScreen.classList.remove('hidden');
}

/* モバイル用の移動制御 */
const moveInterval = {
  left: null,
  right: null
};

function moveCharacter(direction) {
  const step = 10;
  const areaWidth = gameArea.offsetWidth;

  if (direction === 'left') playerX -= step;
  if (direction === 'right') playerX += step;

  // 移動範囲の制限
  if (playerX < 0) playerX = 0;
  if (playerX > areaWidth) playerX = areaWidth;

  player.style.left = `${playerX}px`;
}

function startMove(direction) {
  moveCharacter(direction);
  moveInterval[direction] = setInterval(() => moveCharacter(direction), 100);
}

function stopMove(direction) {
  clearInterval(moveInterval[direction]);
  moveInterval[direction] = null;
}

/* モバイルボタンのイベントリスナー */
leftBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startMove('left');
});
leftBtn.addEventListener('touchend', () => stopMove('left'));
leftBtn.addEventListener('touchcancel', () => stopMove('left'));

rightBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startMove('right');
});
rightBtn.addEventListener('touchend', () => stopMove('right'));
rightBtn.addEventListener('touchcancel', () => stopMove('right'));

/* 初期化処理 */
enemyInterval = setInterval(spawnEnemy, 1000);
bulletInterval = setInterval(spawnBullet, 800);
clearInterval(enemyInterval);
clearInterval(bulletInterval);