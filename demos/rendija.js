const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const RES = 3;
const W = canvas.width;
const H = canvas.height;

const BARRIER_X = 280;
const SCREEN_X = W - 80;
const CY = H / 2;

const wlInput = document.getElementById('wl');
const sepInput = document.getElementById('sep');
const swInput = document.getElementById('sw');
const spInput = document.getElementById('sp');
const oneSlitInput = document.getElementById('oneSlit');
const particlesInput = document.getElementById('particles');

let t = 0;
let hits = new Float32Array(H);
let particleMode = false;

function updateLabels() {
  document.getElementById('wl-val').textContent = wlInput.value;
  document.getElementById('sep-val').textContent = sepInput.value;
  document.getElementById('sw-val').textContent = swInput.value;
  document.getElementById('sp-val').textContent = parseFloat(spInput.value).toFixed(1);
}

function intensityAtScreen(y, slits, k) {
  let re = 0, im = 0;
  for (const s of slits) {
    const d = Math.hypot(SCREEN_X - BARRIER_X, y - s);
    const amp = 1 / Math.sqrt(1 + d * 0.01);
    re += amp * Math.cos(k * d);
    im += amp * Math.sin(k * d);
  }
  return (re * re + im * im) / slits.length;
}

function draw() {
  const wl = parseFloat(wlInput.value);
  const k = (2 * Math.PI) / wl;
  const sep = parseFloat(sepInput.value);
  const sw = parseFloat(swInput.value);
  const speed = parseFloat(spInput.value);
  const omega = speed * 0.18;
  const oneSlit = oneSlitInput.checked;

  if (particleMode !== particlesInput.checked) {
    particleMode = particlesInput.checked;
    hits = new Float32Array(H);
  }

  const slitTop = CY - sep / 2;
  const slitBot = CY + sep / 2;
  const slits = oneSlit ? [slitTop] : [slitTop, slitBot];

  // background
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, W, H);

  // wave field
  const img = ctx.createImageData(BARRIER_X + (SCREEN_X - BARRIER_X), H);
  const data = img.data;
  const fieldW = BARRIER_X + (SCREEN_X - BARRIER_X);

  for (let y = 0; y < H; y += RES) {
    for (let x = 0; x < SCREEN_X; x += RES) {
      let v = 0;
      if (x < BARRIER_X) {
        // plane wave traveling right
        v = Math.cos(k * x - omega * t);
      } else {
        // sum of cylindrical waves from each slit
        let sum = 0;
        for (const s of slits) {
          const d = Math.hypot(x - BARRIER_X, y - s);
          const amp = 1 / Math.sqrt(1 + d * 0.02);
          sum += amp * Math.cos(k * d - omega * t);
        }
        v = sum / Math.max(1, slits.length) * 1.4;
      }
      let val = Math.floor(128 + v * 110);
      val = Math.max(0, Math.min(255, val));
      const r = Math.floor(val * 0.25);
      const g = Math.floor(val * 0.7);
      const b = val;
      for (let dy = 0; dy < RES && y + dy < H; dy++) {
        for (let dx = 0; dx < RES && x + dx < SCREEN_X; dx++) {
          const idx = ((y + dy) * fieldW + (x + dx)) * 4;
          data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // barrier
  ctx.fillStyle = '#2a3145';
  ctx.fillRect(BARRIER_X - 6, 0, 12, slitTop - sw / 2);
  if (oneSlit) {
    ctx.fillRect(BARRIER_X - 6, slitTop + sw / 2, 12, H - (slitTop + sw / 2));
  } else {
    ctx.fillRect(BARRIER_X - 6, slitTop + sw / 2, 12, slitBot - sw / 2 - (slitTop + sw / 2));
    ctx.fillRect(BARRIER_X - 6, slitBot + sw / 2, 12, H - (slitBot + sw / 2));
  }

  // screen
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(SCREEN_X, 0, W - SCREEN_X, H);
  ctx.strokeStyle = '#2a3145';
  ctx.strokeRect(SCREEN_X, 0, W - SCREEN_X, H);

  // intensity profile (continuous)
  if (!particleMode) {
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    let maxI = 0;
    const samples = [];
    for (let y = 0; y < H; y += 2) {
      const i = intensityAtScreen(y, slits, k);
      samples.push({ y, i });
      if (i > maxI) maxI = i;
    }
    for (let j = 0; j < samples.length; j++) {
      const { y, i } = samples[j];
      const px = SCREEN_X + 8 + (i / maxI) * (W - SCREEN_X - 16);
      if (j === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
      // glow on screen
      const intensity = i / maxI;
      ctx.fillStyle = `rgba(96,165,250,${intensity * 0.9})`;
      ctx.fillRect(SCREEN_X, y, 6, 2);
    }
    ctx.stroke();
  } else {
    // particle mode: accumulate hits weighted by intensity
    let maxI = 0;
    const probs = new Float32Array(H);
    for (let y = 0; y < H; y++) {
      probs[y] = intensityAtScreen(y, slits, k);
      if (probs[y] > maxI) maxI = probs[y];
    }
    // sample some particles per frame
    for (let n = 0; n < 12; n++) {
      while (true) {
        const y = Math.floor(Math.random() * H);
        if (Math.random() < probs[y] / maxI) {
          hits[y] += 1;
          break;
        }
      }
    }
    let maxHits = 1;
    for (let y = 0; y < H; y++) if (hits[y] > maxHits) maxHits = hits[y];
    for (let y = 0; y < H; y++) {
      const intensity = hits[y] / maxHits;
      if (intensity > 0.02) {
        ctx.fillStyle = `rgba(255,235,150,${Math.min(1, intensity * 1.2)})`;
        ctx.fillRect(SCREEN_X + 2, y, 10, 1);
      }
    }
    // also draw cumulative histogram curve
    ctx.beginPath();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < H; y++) {
      const px = SCREEN_X + 14 + (hits[y] / maxHits) * (W - SCREEN_X - 22);
      if (y === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  // labels
  ctx.fillStyle = '#9aa3b8';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Onda incidente', BARRIER_X / 2, 20);
  ctx.fillText('Pared', BARRIER_X, H - 8);
  ctx.fillText('Pantalla', SCREEN_X + (W - SCREEN_X) / 2, H - 8);

  t += 1;
  requestAnimationFrame(draw);
}

[wlInput, sepInput, swInput, spInput].forEach(i => i.addEventListener('input', () => {
  updateLabels();
  hits = new Float32Array(H);
}));
oneSlitInput.addEventListener('change', () => { hits = new Float32Array(H); });

updateLabels();
draw();
