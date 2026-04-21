(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayMsg = document.getElementById("overlay-msg");
  const startBtn = document.getElementById("start-btn");

  const W = canvas.width;
  const H = canvas.height;

  const GRAVITY = 1650;
  const FLAP_VY = -420;
  const PIPE_SPEED = 200;
  const PIPE_W = 56;
  const GAP = 150;
  const SPAWN_EVERY = 1.55;
  /** Player car: x,y = center; hw/hh = half extents (hitbox). */
  const CAR = { x: 100, y: H * 0.42, vy: 0, hw: 22, hh: 13 };

  let state = "ready";
  let pipes = [];
  let spawnTimer = 0;
  let score = 0;
  let lastT = 0;

  function resetGame() {
    CAR.y = H * 0.42;
    CAR.vy = 0;
    pipes = [];
    spawnTimer = 0;
    score = 0;
    scoreEl.textContent = "0";
  }

  function flap() {
    if (state === "ready") {
      state = "playing";
      overlay.classList.add("hidden");
      CAR.vy = FLAP_VY;
      lastT = performance.now();
      requestAnimationFrame(loop);
      return;
    }
    if (state === "playing") {
      CAR.vy = FLAP_VY;
    } else if (state === "over") {
      resetGame();
      state = "playing";
      overlay.classList.add("hidden");
      CAR.vy = FLAP_VY;
      lastT = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function addPipe() {
    const margin = 90;
    const minTop = margin;
    const maxTop = H - margin - GAP;
    const topH = minTop + Math.random() * (maxTop - minTop);
    pipes.push({
      x: W + 20,
      topH,
      gap: GAP,
      scored: false,
    });
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function carHitboxInset() {
    return 3;
  }

  function carHitsPipe(p, topH, botY, botH) {
    const inset = carHitboxInset();
    const ax = CAR.x - CAR.hw + inset;
    const ay = CAR.y - CAR.hh + inset;
    const aw = (CAR.hw - inset) * 2;
    const ah = (CAR.hh - inset) * 2;
    return (
      rectsOverlap(ax, ay, aw, ah, p.x, 0, PIPE_W, topH) ||
      rectsOverlap(ax, ay, aw, ah, p.x, botY, PIPE_W, botH)
    );
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#141418");
    g.addColorStop(0.45, "#18181c");
    g.addColorStop(1, "#1c1c22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const t = performance.now();
    ctx.fillStyle = "rgba(167, 139, 250, 0.06)";
    for (let i = 0; i < 6; i++) {
      const bx = ((i * 137 + (t * 0.02) % 200) % (W + 80)) - 40;
      const by = H * 0.55 + Math.sin(i + t * 0.001) * 8;
      ctx.beginPath();
      ctx.ellipse(bx, by, 46, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#27272a";
    ctx.fillRect(0, H - 56, W, 56);
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(0, H - 56, W, 2);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, H - 54, W, 6);
  }

  function drawPipes() {
    for (const p of pipes) {
      ctx.fillStyle = "#2d2d33";
      ctx.strokeStyle = "#7c6cf0";
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.strokeRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x - 4, p.topH - 24, PIPE_W + 8, 24);
      ctx.strokeRect(p.x - 4, p.topH - 24, PIPE_W + 8, 24);

      const botY = p.topH + p.gap;
      const botH = H - botY - 56;
      ctx.fillRect(p.x, botY, PIPE_W, botH);
      ctx.strokeRect(p.x, botY, PIPE_W, botH);
      ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 24);
      ctx.strokeRect(p.x - 4, botY, PIPE_W + 8, 24);
    }
  }

  function drawCar() {
    const { x, y, hw, hh } = CAR;
    ctx.save();
    ctx.translate(x, y);
    const tilt = Math.min(Math.max(CAR.vy * 0.0018, -0.35), 0.45);
    ctx.rotate(tilt);

    const bodyW = hw * 2;
    const bodyH = hh * 1.15;
    const bodyY = -bodyH * 0.35;
    const rx = 5;

    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-hw, bodyY, bodyW, bodyH, rx);
    } else {
      ctx.rect(-hw, bodyY, bodyW, bodyH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-hw + 4, bodyY + bodyH * 0.35, bodyW * 0.38, bodyH * 0.42);
    ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
    ctx.fillRect(-hw + 6, bodyY + bodyH * 0.4, bodyW * 0.32, bodyH * 0.32);

    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-hw * 0.55, bodyY - bodyH * 0.55, bodyW * 0.75, bodyH * 0.55, 4);
    } else {
      ctx.rect(-hw * 0.55, bodyY - bodyH * 0.55, bodyW * 0.75, bodyH * 0.55);
    }
    ctx.fill();
    ctx.stroke();

    const wheelR = 5;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-hw + 8, bodyY + bodyH - 1, wheelR, 0, Math.PI * 2);
    ctx.arc(hw - 8, bodyY + bodyH - 1, wheelR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(-hw + 8, bodyY + bodyH - 1, 2, 0, Math.PI * 2);
    ctx.arc(hw - 8, bodyY + bodyH - 1, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(hw - 3, bodyY + bodyH * 0.35);
    ctx.lineTo(hw + 5, bodyY + bodyH * 0.5);
    ctx.lineTo(hw - 3, bodyY + bodyH * 0.65);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function update(dt) {
    CAR.vy += GRAVITY * dt;
    CAR.y += CAR.vy * dt;

    const ground = H - 56 - CAR.hh;
    const ceiling = CAR.hh;
    if (CAR.y > ground) {
      CAR.y = ground;
      gameOver();
      return;
    }
    if (CAR.y < ceiling) {
      CAR.y = ceiling;
      CAR.vy = 0;
    }

    spawnTimer += dt;
    if (spawnTimer >= SPAWN_EVERY) {
      spawnTimer = 0;
      addPipe();
    }

    for (const p of pipes) {
      p.x -= PIPE_SPEED * dt;
    }
    pipes = pipes.filter((p) => p.x > -PIPE_W - 30);

    for (const p of pipes) {
      const botY = p.topH + p.gap;
      const botH = H - botY - 56;
      if (carHitsPipe(p, p.topH, botY, botH)) {
        gameOver();
        return;
      }
      if (!p.scored && p.x + PIPE_W < CAR.x) {
        p.scored = true;
        score += 1;
        scoreEl.textContent = String(score);
      }
    }
  }

  function gameOver() {
    state = "over";
    overlayTitle.textContent = "Game over";
    overlayMsg.textContent = "Score: " + score + " — tap Play to try again.";
    startBtn.textContent = "Play again";
    overlay.classList.remove("hidden");
  }

  function loop(t) {
    if (state !== "playing") return;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;

    update(dt);
    drawBackground();
    drawPipes();
    drawCar();

    if (state === "playing") requestAnimationFrame(loop);
  }

  function drawIdleFrame() {
    drawBackground();
    drawCar();
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    flap();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      flap();
    }
  });

  startBtn.addEventListener("click", () => {
    if (state === "ready") {
      flap();
    } else if (state === "over") {
      resetGame();
      state = "playing";
      overlay.classList.add("hidden");
      CAR.vy = FLAP_VY;
      lastT = performance.now();
      requestAnimationFrame(loop);
    }
  });

  drawIdleFrame();
})();
