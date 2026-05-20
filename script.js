const canvas = document.getElementById("signalCanvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let ratio = 1;
let points = [];
let animationFrame = 0;

const palette = ["#20b7d9", "#ff5a3d", "#b6d833", "#6b5cff"];

function resizeCanvas() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createPoints();
  draw(0);
}

function createPoints() {
  const count = Math.max(22, Math.min(58, Math.floor((width * height) / 23000)));
  points = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: 2 + Math.random() * 3,
    color: palette[index % palette.length],
  }));
}

function draw(timestamp) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(247, 243, 234, 0.8)";
  ctx.fillRect(0, 0, width, height);

  const lineDistance = Math.min(190, Math.max(120, width * 0.16));

  points.forEach((point, index) => {
    if (!prefersReducedMotion.matches) {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;
    }

    for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
      const next = points[nextIndex];
      const dx = point.x - next.x;
      const dy = point.y - next.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < lineDistance) {
        ctx.strokeStyle = `rgba(13, 17, 23, ${0.08 * (1 - distance / lineDistance)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }

    const pulse = prefersReducedMotion.matches
      ? 0
      : Math.sin(timestamp / 900 + index) * 0.8;

    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!prefersReducedMotion.matches) {
    animationFrame = window.requestAnimationFrame(draw);
  }
}

window.addEventListener("resize", resizeCanvas);
prefersReducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  if (!prefersReducedMotion.matches) {
    animationFrame = window.requestAnimationFrame(draw);
  }
});

resizeCanvas();
if (!prefersReducedMotion.matches) {
  animationFrame = window.requestAnimationFrame(draw);
}
