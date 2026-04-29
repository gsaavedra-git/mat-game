const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const DEFAULT = { ax: 120, ay: 120 };
let cornerA = { x: DEFAULT.ax, y: DEFAULT.ay };
const cornerC = { x: 280, y: 360 };
let cornerB = { x: cornerC.x + (cornerC.y - cornerA.y) * 0.6, y: cornerC.y };

let dragging = null;
const PIXELS_PER_UNIT = 20;

const showSquares = document.getElementById('show-squares');
const showLabels = document.getElementById('show-labels');

function pxToUnits(px) { return px / PIXELS_PER_UNIT; }

function getGeometry() {
  const a = Math.abs(cornerC.y - cornerA.y);
  const b = Math.abs(cornerB.x - cornerC.x);
  cornerA.x = cornerC.x;
  cornerB.y = cornerC.y;
  const c = Math.hypot(a, b);
  return { a, b, c };
}

function draw() {
  const { a, b, c } = getGeometry();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showSquares.checked) {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(cornerC.x - a, cornerA.y - a, a, a);
    ctx.strokeRect(cornerC.x - a, cornerA.y - a, a, a);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.18)';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
    ctx.fillRect(cornerC.x, cornerC.y, b, b);
    ctx.strokeRect(cornerC.x, cornerC.y, b, b);

    ctx.save();
    const angle = Math.atan2(cornerB.y - cornerA.y, cornerB.x - cornerA.x);
    ctx.translate(cornerA.x, cornerA.y);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.8)';
    ctx.fillRect(0, -c, c, c);
    ctx.strokeRect(0, -c, c, c);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.moveTo(cornerA.x, cornerA.y);
  ctx.lineTo(cornerB.x, cornerB.y);
  ctx.lineTo(cornerC.x, cornerC.y);
  ctx.closePath();
  ctx.strokeStyle = '#e6e9f0';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = '#e6e9f0';
  ctx.lineWidth = 1.5;
  const sq = 12;
  const dirX = cornerB.x > cornerC.x ? 1 : -1;
  const dirY = cornerA.y < cornerC.y ? -1 : 1;
  ctx.strokeRect(cornerC.x, cornerC.y + (dirY > 0 ? 0 : -sq), dirX * sq, sq * dirY);

  if (showLabels.checked) {
    ctx.fillStyle = '#e6e9f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`a = ${pxToUnits(a).toFixed(1)}`, cornerC.x - 25, (cornerA.y + cornerC.y) / 2);
    ctx.fillText(`b = ${pxToUnits(b).toFixed(1)}`, (cornerB.x + cornerC.x) / 2, cornerC.y + 22);
    ctx.fillText(`c = ${pxToUnits(c).toFixed(1)}`,
      (cornerA.x + cornerB.x) / 2 + 20,
      (cornerA.y + cornerB.y) / 2 - 10);
  }

  drawHandle(cornerA, '#60a5fa');
  drawHandle(cornerB, '#60a5fa');
  drawHandle(cornerC, '#9aa3b8', true);

  const ua = pxToUnits(a), ub = pxToUnits(b), uc = pxToUnits(c);
  document.getElementById('stat-a').textContent = ua.toFixed(2);
  document.getElementById('stat-b').textContent = ub.toFixed(2);
  document.getElementById('stat-c').textContent = uc.toFixed(2);
  document.getElementById('stat-a2').textContent = (ua * ua).toFixed(2);
  document.getElementById('stat-b2').textContent = (ub * ub).toFixed(2);
  document.getElementById('stat-sum').textContent = (ua * ua + ub * ub).toFixed(2);
  document.getElementById('stat-c2').textContent = (uc * uc).toFixed(2);

  const liv = id => document.getElementById(id);
  if (liv('liv-a')) {
    liv('liv-a').textContent = ua.toFixed(2);
    liv('liv-b').textContent = ub.toFixed(2);
    liv('liv-a2').textContent = (ua*ua).toFixed(2);
    liv('liv-b2').textContent = (ub*ub).toFixed(2);
    liv('liv-a2b').textContent = (ua*ua).toFixed(2);
    liv('liv-b2b').textContent = (ub*ub).toFixed(2);
    liv('liv-sum').textContent = (ua*ua + ub*ub).toFixed(2);
    liv('liv-sum2').textContent = (ua*ua + ub*ub).toFixed(2);
    liv('liv-c').textContent = uc.toFixed(2);
  }
}

function drawHandle(p, color, fixed = false) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, fixed ? 5 : 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#0a0e18';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const t = e.touches ? e.touches[0] : e;
  return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
}

function hitTest(p) {
  if (Math.hypot(p.x - cornerA.x, p.y - cornerA.y) < 18) return 'A';
  if (Math.hypot(p.x - cornerB.x, p.y - cornerB.y) < 18) return 'B';
  return null;
}

function onDown(e) {
  e.preventDefault();
  dragging = hitTest(getMousePos(e));
}
function onMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const p = getMousePos(e);
  if (dragging === 'A') {
    cornerA.y = Math.max(40, Math.min(cornerC.y - 20, p.y));
  } else if (dragging === 'B') {
    cornerB.x = Math.max(cornerC.x + 20, Math.min(canvas.width - 40, p.x));
  }
  draw();
}
function onUp() { dragging = null; }

canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp);

showSquares.addEventListener('change', draw);
showLabels.addEventListener('change', draw);
document.getElementById('reset').addEventListener('click', () => {
  cornerA = { x: DEFAULT.ax, y: DEFAULT.ay };
  cornerB = { x: cornerC.x + 160, y: cornerC.y };
  draw();
});

draw();
