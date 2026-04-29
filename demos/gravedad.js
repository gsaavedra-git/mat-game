const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PIXELS_PER_METER = 25;
const balls = [];
let vMax = 0;

const gInput = document.getElementById('g');
const dragInput = document.getElementById('drag');
const bounceInput = document.getElementById('bounce');
const gVal = document.getElementById('g-val');
const dVal = document.getElementById('d-val');
const bVal = document.getElementById('b-val');

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185'];

function addBall(x, y) {
  balls.push({
    x, y,
    vx: (Math.random() - 0.5) * 60,
    vy: 0,
    r: 12 + Math.random() * 6,
    color: COLORS[balls.length % COLORS.length],
    trail: [],
  });
}

function step(dt) {
  const g = parseFloat(gInput.value) * PIXELS_PER_METER;
  const drag = parseFloat(dragInput.value);
  const bounce = parseFloat(bounceInput.value);

  for (const b of balls) {
    b.vy += g * dt;
    b.vx -= b.vx * drag * 60 * dt;
    b.vy -= b.vy * drag * 60 * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.y + b.r > canvas.height) {
      b.y = canvas.height - b.r;
      b.vy = -b.vy * bounce;
      b.vx *= 0.98;
      if (Math.abs(b.vy) < 20) b.vy = 0;
    }
    if (b.x - b.r < 0) { b.x = b.r; b.vx = -b.vx * bounce; }
    if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.vx = -b.vx * bounce; }

    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 25) b.trail.shift();

    const speed = Math.hypot(b.vx, b.vy) / PIXELS_PER_METER;
    if (speed > vMax) vMax = speed;
  }
}

function draw() {
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let y = 0; y < canvas.height; y += PIXELS_PER_METER) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.strokeStyle = '#2a3145';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 1);
  ctx.lineTo(canvas.width, canvas.height - 1);
  ctx.stroke();

  for (const b of balls) {
    ctx.strokeStyle = b.color + '55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    b.trail.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  document.getElementById('count').textContent = balls.length;
  document.getElementById('vmax').textContent = vMax.toFixed(1) + ' m/s';
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  step(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  addBall(x, y);
});

document.getElementById('add').addEventListener('click', () => {
  addBall(canvas.width / 2 + (Math.random() - 0.5) * 200, 60);
});
document.getElementById('clear').addEventListener('click', () => {
  balls.length = 0; vMax = 0;
});

gInput.addEventListener('input', () => gVal.textContent = parseFloat(gInput.value).toFixed(2) + ' m/s²');
dragInput.addEventListener('input', () => dVal.textContent = parseFloat(dragInput.value).toFixed(3));
bounceInput.addEventListener('input', () => bVal.textContent = parseFloat(bounceInput.value).toFixed(2));

document.querySelectorAll('button[data-g]').forEach(btn => {
  btn.addEventListener('click', () => {
    gInput.value = btn.dataset.g;
    gInput.dispatchEvent(new Event('input'));
  });
});

addBall(canvas.width / 2, 60);
