const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const sgInput = document.getElementById('sg');
const rhInput = document.getElementById('rh');
const btInput = document.getElementById('bt');
const spInput = document.getElementById('sp');
const rotInput = document.getElementById('rot');

function updateLabels() {
  document.getElementById('sg-val').textContent = parseFloat(sgInput.value).toFixed(1);
  document.getElementById('rh-val').textContent = parseFloat(rhInput.value).toFixed(1);
  document.getElementById('bt-val').textContent = parseFloat(btInput.value).toFixed(2);
  document.getElementById('sp-val').textContent = parseFloat(spInput.value).toFixed(1);
  document.getElementById('rot-val').textContent = parseFloat(rotInput.value).toFixed(2);
}

let particles = [];
const TRAIL = 1400;

function resetParticles() {
  particles = [
    { x: 1, y: 1, z: 1, color: '#60a5fa', trail: [] },
    { x: 1.000001, y: 1, z: 1, color: '#fbbf24', trail: [] },
  ];
}
resetParticles();

let yaw = 0.6;
let pitch = -0.3;
let dragging = false;
let lastMouse = null;

canvas.addEventListener('mousedown', e => {
  dragging = true;
  lastMouse = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  yaw += dx * 0.01;
  pitch += dy * 0.01;
  pitch = Math.max(-1.4, Math.min(1.4, pitch));
  lastMouse = { x: e.clientX, y: e.clientY };
});

function step(p, sg, rh, bt, dt) {
  // RK4 integration
  const f = (x, y, z) => [sg * (y - x), x * (rh - z) - y, x * y - bt * z];
  const [k1x, k1y, k1z] = f(p.x, p.y, p.z);
  const [k2x, k2y, k2z] = f(p.x + dt * k1x / 2, p.y + dt * k1y / 2, p.z + dt * k1z / 2);
  const [k3x, k3y, k3z] = f(p.x + dt * k2x / 2, p.y + dt * k2y / 2, p.z + dt * k2z / 2);
  const [k4x, k4y, k4z] = f(p.x + dt * k3x, p.y + dt * k3y, p.z + dt * k3z);
  p.x += dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6;
  p.y += dt * (k1y + 2 * k2y + 2 * k3y + k4y) / 6;
  p.z += dt * (k1z + 2 * k2z + 2 * k3z + k4z) / 6;
}

function project(x, y, z) {
  // center around attractor mean
  const cx = x, cy = y, cz = z - 25;
  // rotate around vertical (yaw), then around horizontal (pitch)
  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const x1 = cx * cosY - cy * sinY;
  const y1 = cx * sinY + cy * cosY;
  const z1 = cz;
  const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
  const y2 = y1 * cosP - z1 * sinP;
  const z2 = y1 * sinP + z1 * cosP;
  const x2 = x1;
  // perspective
  const focal = 600;
  const dist = 110;
  const scale = focal / (focal + (y2 + dist));
  return {
    sx: W / 2 + x2 * 9 * scale,
    sy: H / 2 - z2 * 9 * scale,
    depth: y2,
  };
}

function draw() {
  const sg = parseFloat(sgInput.value);
  const rh = parseFloat(rhInput.value);
  const bt = parseFloat(btInput.value);
  const sp = parseFloat(spInput.value);
  const rotSpeed = parseFloat(rotInput.value);

  yaw += rotSpeed * 0.005;

  // step simulation multiple substeps per frame for smooth fast trails
  const substeps = 6;
  const dt = 0.005 * sp;
  for (let s = 0; s < substeps; s++) {
    for (const p of particles) {
      step(p, sg, rh, bt, dt);
      const pr = project(p.x, p.y, p.z);
      p.trail.push(pr);
      if (p.trail.length > TRAIL) p.trail.shift();
    }
  }

  // fade background
  ctx.fillStyle = 'rgba(15, 20, 32, 0.18)';
  ctx.fillRect(0, 0, W, H);

  // draw trails
  for (const p of particles) {
    const tr = p.trail;
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1];
      const b = tr[i];
      const alpha = i / tr.length;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = alpha * 0.85;
      ctx.lineWidth = 1.2 + alpha * 0.8;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // current heads
  for (const p of particles) {
    const last = p.trail[p.trail.length - 1];
    if (!last) continue;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(last.sx, last.sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // separation indicator
  const a = particles[0], b = particles[1];
  const sep = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  ctx.fillStyle = '#9aa3b8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Separación entre las dos partículas: ${sep.toExponential(2)}`, 14, 24);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(14, 34, 12, 4);
  ctx.fillStyle = '#9aa3b8';
  ctx.fillText('partícula A', 32, 40);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(14, 52, 12, 4);
  ctx.fillStyle = '#9aa3b8';
  ctx.fillText('partícula B (inicio: +0.000001)', 32, 58);
  ctx.fillText('Arrastra para rotar', W - 140, H - 14);

  requestAnimationFrame(draw);
}

[sgInput, rhInput, btInput, spInput, rotInput].forEach(i => i.addEventListener('input', updateLabels));
document.getElementById('reset').addEventListener('click', resetParticles);
document.getElementById('preset').addEventListener('click', () => {
  sgInput.value = 10;
  rhInput.value = 28;
  btInput.value = (8 / 3).toFixed(2);
  updateLabels();
  resetParticles();
});

updateLabels();
draw();
