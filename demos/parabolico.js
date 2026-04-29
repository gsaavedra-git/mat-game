const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PPM = 4; // pixels per meter
const ORIGIN = { x: 60, y: canvas.height - 40 };

const angInput = document.getElementById('ang');
const velInput = document.getElementById('vel');
const gInput = document.getElementById('g');

const trajectories = [];
let active = null;

function updatePreview() {
  const ang = parseFloat(angInput.value);
  const vel = parseFloat(velInput.value);
  const g = parseFloat(gInput.value);
  document.getElementById('ang-val').textContent = ang + '°';
  document.getElementById('vel-val').textContent = vel + ' m/s';
  document.getElementById('g-val').textContent = g.toFixed(2) + ' m/s²';

  const rad = ang * Math.PI / 180;
  const vx = vel * Math.cos(rad);
  const vy = vel * Math.sin(rad);
  const tflight = (2 * vy) / g;
  const range = vx * tflight;
  const hmax = (vy * vy) / (2 * g);

  document.getElementById('range-val').textContent = range.toFixed(1) + ' m';
  document.getElementById('hmax').textContent = hmax.toFixed(1) + ' m';
  document.getElementById('tflight').textContent = tflight.toFixed(2) + ' s';
  document.getElementById('vx').textContent = vx.toFixed(1) + ' m/s';
  document.getElementById('vy').textContent = vy.toFixed(1) + ' m/s';

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('liv-v0', vel); set('liv-v0b', vel);
  set('liv-ang', ang); set('liv-angb', ang);
  set('liv-vx', vx.toFixed(2));
  set('liv-vy', vy.toFixed(2));
  set('liv-t', tflight.toFixed(2));
  set('liv-r', range.toFixed(2));
  set('liv-h', hmax.toFixed(2));
}

function launch() {
  const ang = parseFloat(angInput.value) * Math.PI / 180;
  const vel = parseFloat(velInput.value);
  active = {
    x: 0, y: 0,
    vx: vel * Math.cos(ang),
    vy: vel * Math.sin(ang),
    g: parseFloat(gInput.value),
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    trail: [],
  };
}

function step(dt) {
  if (!active) return;
  active.vy -= active.g * dt;
  active.x += active.vx * dt;
  active.y += active.vy * dt;
  active.trail.push({ x: active.x, y: active.y });
  if (active.y < 0) {
    trajectories.push(active);
    if (trajectories.length > 8) trajectories.shift();
    active = null;
  }
}

function worldToCanvas(p) {
  return { x: ORIGIN.x + p.x * PPM, y: ORIGIN.y - p.y * PPM };
}

function draw() {
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid en metros
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let m = 0; m < 200; m += 10) {
    const x = ORIGIN.x + m * PPM;
    if (x > canvas.width) break;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ORIGIN.y); ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '10px monospace';
    ctx.fillText(m + 'm', x + 2, ORIGIN.y - 4);
  }
  for (let m = 10; m < 150; m += 10) {
    const y = ORIGIN.y - m * PPM;
    if (y < 0) break;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(ORIGIN.x, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.fillText(m + 'm', 4, y + 3);
  }

  // suelo
  ctx.strokeStyle = '#2a3145'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, ORIGIN.y); ctx.lineTo(canvas.width, ORIGIN.y); ctx.stroke();

  // cañón con ángulo
  const ang = parseFloat(angInput.value) * Math.PI / 180;
  ctx.save();
  ctx.translate(ORIGIN.x, ORIGIN.y);
  ctx.rotate(-ang);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-5, -8, 35, 16);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(ORIGIN.x, ORIGIN.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#334155';
  ctx.fill();

  // trayectoria predictiva (línea punteada)
  const vel = parseFloat(velInput.value);
  const g = parseFloat(gInput.value);
  ctx.strokeStyle = 'rgba(96,165,250,0.4)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  for (let t = 0; t < 30; t += 0.1) {
    const x = vel * Math.cos(ang) * t;
    const y = vel * Math.sin(ang) * t - 0.5 * g * t * t;
    if (y < 0) break;
    const p = worldToCanvas({ x, y });
    if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // trayectorias guardadas
  for (const tr of trajectories) {
    ctx.strokeStyle = tr.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    tr.trail.forEach((p, i) => {
      const c = worldToCanvas(p);
      if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();
  }

  // proyectil activo
  if (active) {
    ctx.strokeStyle = active.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    active.trail.forEach((p, i) => {
      const c = worldToCanvas(p);
      if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();
    const c = worldToCanvas(active);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = active.color;
    ctx.fill();
  }
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

[angInput, velInput, gInput].forEach(i => i.addEventListener('input', updatePreview));
document.getElementById('launch').addEventListener('click', launch);
document.getElementById('clear').addEventListener('click', () => { trajectories.length = 0; });

updatePreview();
