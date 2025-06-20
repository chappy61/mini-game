const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const hpDisplay = document.getElementById('hpDisplay');
const guide = document.getElementById('guide');
const gameOverDisplay = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const resultScreen = document.getElementById('resultScreen');
const finalScore = document.getElementById('finalScore')

let playerX = gameArea.offsetWidth / 2;
let hp = 3;
let score = 0;
let isGameRunning = false;
let enemyInterval;
let bulletInterval;

// ==========================
// スタート画面
// ==========================
// Enterでゲーム開始
document.addEventListener('keydown', (e) => {
  if (!isGameRunning && e.key === 'Enter') {
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
  updateScoreDisplay(); // あとで作る

  playerX = gameArea.offsetWidth / 2;
  player.style.left = `${playerX}px`;

  // 敵＆弾の発生開始
  enemyInterval = setInterval(spawnEnemy, 1000);
  bulletInterval = setInterval(spawnBullet, 800);
}

// ==========================
// プレイヤー移動
// ==========================
document.addEventListener('keydown', (e) => {
  const step = 20;
  const areaWidth = gameArea.offsetWidth;

  if (e.key === 'ArrowLeft') playerX -= step;
  if (e.key === 'ArrowRight') playerX += step;

  // 範囲制限
  if (playerX < 0) playerX = 0;
  if (playerX > areaWidth) playerX = areaWidth;

  player.style.left = `${playerX}px`;
});

// ==========================
// HP表示
// ==========================
function updateHPDisplay() {
  hpDisplay.textContent = `HP: ${hp}`;
}
updateHPDisplay();

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

    // 敵 vs プレイヤー
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

    // 下に出たら削除
    if (posY > window.innerHeight) {
      clearInterval(fall);
      enemy.remove();
    }
  }, 16);
}

// ==========================
// 弾（▲）生成
// ==========================
const bullets = [];

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
// ゲームオーバー演出
// ==========================
function triggerGameOver() {
  isGameRunning = false;
  clearInterval(enemyInterval);
  clearInterval(bulletInterval);
  guide.style.display = 'none';
  finalScore.textContent = `SCORE: ${score}`;
  resultScreen.classList.remove('hidden');
}


// （補助：キー操作切り離し）
function handleMovement(e) {
  const step = 20;
  const areaWidth = gameArea.offsetWidth;

  if (e.key === 'ArrowLeft') playerX -= step;
  if (e.key === 'ArrowRight') playerX += step;

  if (playerX < 0) playerX = 0;
  if (playerX > areaWidth) playerX = areaWidth;

  player.style.left = `${playerX}px`;
}
document.addEventListener('keydown', (e) => {
  if (!isGameRunning && e.key === 'r') {
    startGame();
  }
});
// ==========================
// スコア処理
// ==========================
const scoreDisplay = document.getElementById('scoreDisplay');

function updateScoreDisplay() {
  scoreDisplay.textContent = `SCORE: ${score}`;
}

// ==========================
// 開始処理
// ==========================
enemyInterval = setInterval(spawnEnemy, 1000);
bulletInterval = setInterval(spawnBullet, 800);

clearInterval(enemyInterval);
clearInterval(bulletInterval);

