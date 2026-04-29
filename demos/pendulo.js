const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const pivot = { x: canvas.width / 2, y: 200 };
const G = 1; // unidades visuales

function makePendulum(theta1, theta2) {
  return { a1: theta1, a2: theta2, av1: 0, av2: 0, trail: [] };
}

let p1 = makePendulum(Math.PI / 2, Math.PI / 2);
let p2 = makePendulum(Math.PI / 2 + 0.005, Math.PI / 2);

function getParams() {
  return {
    L1: parseFloat(document.getElementById('l1').value),
    L2: parseFloat(document.getElementById('l2').value),
    M1: parseFloat(document.getElementById('m1').value),
    M2: parseFloat(document.getElementById('m2').value),
    fric: parseFloat(document.getElementById('fr').value),
  };
}

function physics(p, params) {
  const { L1, L2, M1, M2, fric } = params;
  const { a1, a2, av1, av2 } = p;
  const num1 = -G * (2 * M1 + M2) * Math.sin(a1)
             - M2 * G * Math.sin(a1 - 2 * a2)
             - 2 * Math.sin(a1 - a2) * M2 * (av2 * av2 * L2 + av1 * av1 * L1 * Math.cos(a1 - a2));
  const den1 = L1 * (2 * M1 + M2 - M2 * Math.cos(2 * a1 - 2 * a2));
  const aa1 = num1 / den1;

  const num2 = 2 * Math.sin(a1 - a2) * (av1 * av1 * L1 * (M1 + M2)
             + G * (M1 + M2) * Math.cos(a1)
             + av2 * av2 * L2 * M2 * Math.cos(a1 - a2));
  const den2 = L2 * (2 * M1 + M2 - M2 * Math.cos(2 * a1 - 2 * a2));
  const aa2 = num2 / den2;

  p.av1 = (p.av1 + aa1) * (1 - fric);
  p.av2 = (p.av2 + aa2) * (1 - fric);
  p.a1 += p.av1;
  p.a2 += p.av2;
}

function positions(p, params) {
  const { L1, L2 } = params;
  const x1 = pivot.x + L1 * Math.sin(p.a1);
  const y1 = pivot.y + L1 * Math.cos(p.a1);
  const x2 = x1 + L2 * Math.sin(p.a2);
  const y2 = y1 + L2 * Math.cos(p.a2);
  return { x1, y1, x2, y2 };
}

function drawPendulum(p, params, color, isTwin) {
  const { x1, y1, x2, y2 } = positions(p, params);
  const { M1, M2 } = params;

  if (p.trail.length > 1) {
    ctx.strokeStyle = isTwin ? 'rgba(244,114,182,0.6)' : 'rgba(74,222,128,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    p.trail.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
    ctx.stroke();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pivot.x, pivot.y);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x1, y1, M1 * 0.4 + 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x2, y2, M2 * 0.4 + 4, 0, Math.PI * 2); ctx.fill();

  p.trail.push({ x: x2, y: y2 });
  if (p.trail.length > 800) p.trail.shift();
}

function draw() {
  ctx.fillStyle = 'rgba(10,14,24,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const params = getParams();
  for (let i = 0; i < 3; i++) {
    physics(p1, params);
    if (document.getElementById('show-twin').checked) physics(p2, params);
  }

  ctx.fillStyle = '#9aa3b8';
  ctx.beginPath(); ctx.arc(pivot.x, pivot.y, 5, 0, Math.PI * 2); ctx.fill();

  if (document.getElementById('show-twin').checked) {
    drawPendulum(p2, params, '#f472b6', true);
  }
  drawPendulum(p1, params, '#4ade80', false);
}

function clearCanvas() {
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function reset() {
  p1 = makePendulum(Math.PI / 2, Math.PI / 2);
  p2 = makePendulum(Math.PI / 2 + 0.005, Math.PI / 2);
  clearCanvas();
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

['l1','l2','m1','m2','fr'].forEach(id => {
  document.getElementById(id).addEventListener('input', e => {
    document.getElementById(id + '-val').textContent =
      id === 'fr' ? parseFloat(e.target.value).toFixed(3) : e.target.value;
  });
});
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('clear-trail').addEventListener('click', () => {
  p1.trail = []; p2.trail = []; clearCanvas();
});

clearCanvas();
loop();
