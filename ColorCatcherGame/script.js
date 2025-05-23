const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let timeLeft = 90;
const scoreboard = document.getElementById("scoreboard");
const highscoreDisplay = document.getElementById("highscore");
const colorBox = document.getElementById("colorBox");

const colors = ["red", "green", "blue", "yellow", "magenta", "cyan"];
let targetColor = colors[Math.floor(Math.random() * colors.length)];
colorBox.style.backgroundColor = targetColor;

const catcher = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 50,
  width: 100,
  height: 20,
  moveTo(x) {
    this.x = Math.min(canvas.width - this.width, Math.max(0, x - this.width / 2));
  },
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

const balls = [];
let ballSpeed = 3;
let spawnRate = 1000;

function spawnBall() {
  // İstenen renkte topun çıkma olasılığını arttırmak için
  let randomNum = Math.random();
  let color;
  if (randomNum < 0.5) {
    color = targetColor;
  } else {
    // Rastgele diğer renklerden seç
    let otherColors = colors.filter(c => c !== targetColor);
    color = otherColors[Math.floor(Math.random() * otherColors.length)];
  }

  balls.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    radius: 20,
    speed: ballSpeed,
    color,
  });
}

function updateBalls() {
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    ball.y += ball.speed;


    if (
      ball.y + ball.radius >= catcher.y &&
      ball.x >= catcher.x &&
      ball.x <= catcher.x + catcher.width
    ) {
      if (ball.color === targetColor) {
        score += 10;
      } else {
        score = Math.max(0, score - 5);
      }
      balls.splice(i, 1);
      continue;
    }


    if (ball.y - ball.radius > canvas.height) {
      balls.splice(i, 1);
    }
  }
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  });
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  catcher.draw();
  updateBalls();
  drawBalls();
  scoreboard.innerText = `Score: ${score} | Time: ${timeLeft}`;
  updateHighScoreDisplay();
}

canvas.addEventListener("mousemove", e => catcher.moveTo(e.clientX));
canvas.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  catcher.moveTo(touch.clientX);
});

let gameInterval = setInterval(() => {
  update();
}, 1000 / 90);

let ballInterval = setInterval(spawnBall, spawnRate);

let timerInterval = setInterval(() => {
  timeLeft--;
  if (timeLeft <= 0) {
    clearInterval(gameInterval);
    clearInterval(ballInterval);
    clearInterval(timerInterval);

    if (score > highScore) {
      saveHighScore(score);
    }

    alert(`Game over! Your score: ${score}`);
  }

  if (timeLeft % 10 === 0 && timeLeft !== 90) {
    ballSpeed += 0.5;
    if (spawnRate > 300) {
      clearInterval(ballInterval);
      spawnRate -= 100;
      ballInterval = setInterval(spawnBall, spawnRate);
    }
  }

  if ((90 - timeLeft) % 8 === 0) {
    let newColor;
    do {
      newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === targetColor);
    targetColor = newColor;
    colorBox.style.backgroundColor = targetColor;
  }
}, 1000);

// Yüksek skoru localStorage ve PHP'den çekiyoruz
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
updateHighScoreDisplay();

// Yüksek skoru PHP'ye kaydet
function saveHighScore(score) {
  fetch("save_score.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `score=${score}`,
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        highScore = data.newHigh;
        localStorage.setItem("highScore", highScore);
        updateHighScoreDisplay();
      } else {
        console.error("Error saving score:", data.error);
      }
    })
    .catch(err => console.error("Fetch error:", err));
}

function updateHighScoreDisplay() {
  highscoreDisplay.innerText = `High Score: ${highScore}`;
}

// Yeniden başlatma butonu için fonksiyon
function restartGame() {
  score = 0;
  timeLeft = 90;
  ballSpeed = 3;
  spawnRate = 1000;
  balls.length = 0;

  clearInterval(gameInterval);
  clearInterval(ballInterval);
  clearInterval(timerInterval);

  gameInterval = setInterval(() => {
    update();
  }, 1000 / 90);

  ballInterval = setInterval(spawnBall, spawnRate);

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      clearInterval(ballInterval);
      clearInterval(timerInterval);

      if (score > highScore) {
        saveHighScore(score);
      }

      alert(`Game over! Your score: ${score}`);
    }

    if (timeLeft % 10 === 0 && timeLeft !== 90) {
      ballSpeed += 0.5;
      if (spawnRate > 300) {
        clearInterval(ballInterval);
        spawnRate -= 100;
        ballInterval = setInterval(spawnBall, spawnRate);
      }
    }

    if ((90 - timeLeft) % 8 === 0) {
      let newColor;
      do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
      } while (newColor === targetColor);
      targetColor = newColor;
      colorBox.style.backgroundColor = targetColor;
    }
  }, 1000);
}
document.getElementById("restartButton").addEventListener("click", restartGame);
