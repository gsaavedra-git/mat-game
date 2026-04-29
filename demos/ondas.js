const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const RES = 4; // pixel block size (lower = sharper, slower)
const W = canvas.width;
const H = canvas.height;

let sources = [
  { x: 250, y: 280 },
  { x: 450, y: 280 },
  { x: 350, y: 180 },
  { x: 350, y: 380 },
];

let t = 0;
let dragging = -1;

const wlInput = document.getElementById('wl');
const spInput = document.getElementById('sp');
const nsInput = document.getElementById('ns');
const linesInput = document.getElementById('lines');

function updateLabels() {
  document.getElementById('wl-val').textContent = wlInput.value;
  document.getElementById('sp-val').textContent = parseFloat(spInput.value).toFixed(1);
  document.getElementById('ns-val').textContent = nsInput.value;
}

function draw() {
  const wl = parseFloat(wlInput.value);
  const k = (2 * Math.PI) / wl;
  const speed = parseFloat(spInput.value);
  const omega = speed * 0.15;
  const n = parseInt(nsInput.value);
  const useLines = linesInput.checked;

  const img = ctx.createImageData(W, H);
  const data = img.data;

  for (let y = 0; y < H; y += RES) {
    for (let x = 0; x < W; x += RES) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const s = sources[i];
        const d = Math.hypot(x - s.x, y - s.y);
        const amp = 1 / (1 + d * 0.012);
        sum += amp * Math.cos(k * d - omega * t);
      }
      const norm = sum / n;
      let v;
      if (useLines) {
        v = Math.abs(norm) > 0.7 ? 255 : Math.floor(128 + norm * 127);
      } else {
        v = Math.floor(128 + norm * 200);
      }
      v = Math.max(0, Math.min(255, v));
      const r = Math.floor(v * 0.3);
      const g = Math.floor(v * 0.85);
      const b = v;

      for (let dy = 0; dy < RES && y + dy < H; dy++) {
        for (let dx = 0; dx < RES && x + dx < W; dx++) {
          const idx = ((y + dy) * W + (x + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0);

  for (let i = 0; i < n; i++) {
    const s = sources[i];
    ctx.beginPath();
    ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i + 1, s.x, s.y);
  }

  t += 1;
  requestAnimationFrame(draw);
}

function getMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  const t = e.touches ? e.touches[0] : e;
  return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
}

canvas.addEventListener('mousedown', e => {
  const p = getMouse(e);
  const n = parseInt(nsInput.value);
  for (let i = 0; i < n; i++) {
    if (Math.hypot(p.x - sources[i].x, p.y - sources[i].y) < 18) {
      dragging = i; return;
    }
  }
});
canvas.addEventListener('mousemove', e => {
  if (dragging < 0) return;
  const p = getMouse(e);
  sources[dragging].x = Math.max(20, Math.min(W - 20, p.x));
  sources[dragging].y = Math.max(20, Math.min(H - 20, p.y));
});
window.addEventListener('mouseup', () => dragging = -1);

[wlInput, spInput, nsInput].forEach(i => i.addEventListener('input', updateLabels));
document.getElementById('reset').addEventListener('click', () => {
  sources = [
    { x: 250, y: 280 },
    { x: 450, y: 280 },
    { x: 350, y: 180 },
    { x: 350, y: 380 },
  ];
});

updateLabels();
draw();
