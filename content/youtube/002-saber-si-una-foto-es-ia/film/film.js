// film.js — «Ya puedes saber si una foto es de IA» (IA Sin Rollos 002). One viral photo, three ways to check it, a 4-step method.
import * as E from './engine.js';
const { clamp, lerp, seg, ss, eo, eio, back, hash, TAU, W, H, PAL, font, rr, rgba } = E;
E.setAccent('#8B7CFF');
PAL.red = '#FF4D5E';

let L = [], SUBS = [];                       // narration lines (exact times from tools/voice.py) and subtitle cues
export let DUR = 158;
export const getSubs = () => SUBS;
const at = i => L[i].t0;                     // start of line i
const secStart = s => L.find(l => l.sec === s).t0 - (s ? 0.35 : 0.4);
export function setLines(lines) {
  L = lines; DUR = +(L[L.length - 1].t1 + 3.2).toFixed(2);
  // subtitles: each line split into ≤7-word toasts, timed by word share inside the line; toasts < 1.8 s merge while ≤ 72 chars
  SUBS = [];
  for (const l of L) {
    const w = l.text.split(' '), n = Math.max(1, Math.round(w.length / 7)), parts = [];
    for (let k = 0; k < n; k++) parts.push(w.slice(Math.round(k * w.length / n), Math.round((k + 1) * w.length / n)).join(' '));
    let t = l.t0; const cues = [];
    for (const p of parts) { const d = (l.t1 - l.t0) * p.split(' ').length / w.length; cues.push({ t0: t, t1: t + d, text: p }); t += d; }
    for (let i = 0; i < cues.length; i++) if (cues[i].t1 - cues[i].t0 < 1.8 && cues.length > 1) {
      const j = i + 1 < cues.length ? i + 1 : i - 1, a = Math.min(i, j), b = Math.max(i, j), txt = cues[a].text + ' ' + cues[b].text;
      if (txt.length <= 72) { cues.splice(a, 2, { t0: cues[a].t0, t1: cues[b].t1, text: txt }); i = -1; }
    }
    SUBS.push(...cues);
  }
}

// ───────── helpers (same kit as video 001) ─────────
function text(g, s, x, y, px, wt = 500, col = PAL.text, o = {}) {
  g.save(); g.font = font(px, wt, o.fam || 'ui'); g.fillStyle = col; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  if (o.alpha != null) g.globalAlpha *= o.alpha; g.fillText(s, x, y); g.restore();
}
const pop = (t, t0) => back(seg(t, t0, t0 + 0.26), 1.3);
function chip(g, s, x, y, o = {}) {
  const { accent = false, red = false, px = 26, mono = false, center = false } = o;
  g.save(); g.font = font(px, 600, mono ? 'mono' : 'ui');
  const w = g.measureText(s).width + px * 1.4, h = px * 1.9, xx = center ? x - w / 2 : x, c = red ? PAL.red : accent ? PAL.accent : null;
  if (c) { g.shadowColor = rgba(c, 0.6); g.shadowBlur = 18; }
  g.fillStyle = c ? rgba(c, 0.16) : 'rgba(255,255,255,.06)'; rr(g, xx, y, w, h, h / 2); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = c ? rgba(c, 0.85) : 'rgba(255,255,255,.14)'; g.lineWidth = 1.5; rr(g, xx + 0.5, y + 0.5, w - 1, h - 1, h / 2); g.stroke();
  g.fillStyle = c || PAL.text; g.textBaseline = 'middle'; g.fillText(s, xx + px * 0.7, y + h / 2 + 1); g.restore(); return w;
}
function popAt(g, t, t0, x, y, draw) { const q = pop(t, t0); if (q <= 0) return; g.save(); g.translate(x, y); g.scale(q, q); draw(); g.restore(); }
function header(g, t, t0, label, title) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const p = seg(t, t0 + 0.3, t0 + 0.75), q = back(p, 1.3);
  text(g, label, 120, 150 - (1 - q) * 14, 22, 600, PAL.accent, { fam: 'mono', alpha: p });
  text(g, title, 120, 222 - (1 - q) * 24, 64, 600, PAL.text, { alpha: p });
  g.restore();
}
function stage(g, cam) { E.bg(g); E.grid(g, { ox: W / 2 - cam.x * cam.zoom, oy: H / 2 - cam.y * cam.zoom, scale: cam.zoom }); cam.apply(g); }
function expandClip(g, t, t0, cx, cy) {
  const p = back(seg(t, t0 - 0.04, t0 + 0.42), 1.3); if (p >= 1) return false;
  const w = lerp(160, W + 40, p), h = lerp(56, H + 40, p);
  g.save(); rr(g, cx - w / 2 + (W / 2 - cx) * p, cy - h / 2 + (H / 2 - cy) * p, w, h, lerp(28, 0, p)); g.clip(); return true;
}

// The viral photo: a code-drawn sunset with a figure (fictional; no real person or event)
export function photo(g, x, y, w, h, o = {}) {
  const { dots = 0, smooth = 0 } = o;
  g.save(); rr(g, x, y, w, h, 18); g.clip();
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#2B3A67'); sky.addColorStop(0.55, '#C8746A'); sky.addColorStop(1, '#F2B880');
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  E.glow(g, x + w * 0.68, y + h * 0.5, h * 0.5, '#FFD9A0', 0.5); g.fillStyle = '#FFE2B0'; g.beginPath(); g.arc(x + w * 0.68, y + h * 0.5, h * 0.09, 0, TAU); g.fill();
  const mt = (k, col, amp) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + h); for (let i = 0; i <= 24; i++) g.lineTo(x + w * i / 24, y + h * (0.58 + k) - Math.abs(Math.sin(i * 0.9 + k * 7)) * h * amp); g.lineTo(x + w, y + h); g.fill(); };
  mt(0, '#5B4A6B', 0.16); mt(0.1, '#3A2F48', 0.1);
  g.fillStyle = '#1E1828'; g.fillRect(x, y + h * 0.82, w, h * 0.18);
  // a figure on the shore
  const fx = x + w * 0.34, fy = y + h * 0.82; g.fillStyle = '#120E18';
  g.beginPath(); g.arc(fx, fy - h * 0.2, h * 0.035, 0, TAU); g.fill(); rr(g, fx - h * 0.035, fy - h * 0.165, h * 0.07, h * 0.165, h * 0.03); g.fill();
  if (smooth > 0) { g.fillStyle = `rgba(255,220,200,${0.12 * smooth})`; g.fillRect(x, y, w, h); }
  if (dots > 0) {                                     // the invisible watermark, revealed
    for (let j = 0; j < h / 22; j++) for (let i = 0; i < w / 22; i++) { const v = hash(i * 31.7 + j * 7.3);
      if (v > 0.55) { g.fillStyle = rgba(PAL.accent, 0.75 * dots * (v - 0.55) / 0.45); g.fillRect(x + i * 22 + 9, y + j * 22 + 9, 4, 4); } }
  }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.5; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, 18); g.stroke();
}
export function stamp(g, s, x, y, col, p, rot = -0.12) {
  if (p <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); const k = lerp(1.6, 1, back(p, 1.6)); g.scale(k, k); g.globalAlpha = clamp(p * 2);
  g.font = font(64, 800, 'disp'); const w = g.measureText(s).width + 60;
  g.strokeStyle = col; g.lineWidth = 8; g.shadowColor = rgba(col, 0.7); g.shadowBlur = 20; rr(g, -w / 2, -52, w, 104, 16); g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 4); g.restore();
}
function chatPanel(g, t, t0, o = {}) {        // a group chat: the photo arrives, forwards pile up
  const x = 560, y = 110, w = 800, h = 780;
  const r = E.windowBox(g, x, y, w, h, { title: 'Familia', app: 2 });
  ['¿Habéis visto esto?', '¡Increíble!'].forEach((s, i) => popAt(g, t, t0 + 0.3 + i * 0.5, x + 40, y + 80 + i * 74, () => {
    g.fillStyle = PAL.surf2; g.font = font(26, 500); const tw = g.measureText(s).width + 48; rr(g, 0, 0, tw, 56, 22); g.fill(); text(g, s, 24, 37, 26, 500, PAL.text); }));
  const pp = pop(t, t0 + 1.6);
  if (pp > 0) { g.save(); g.translate(x + w - 520, y + 250 + (1 - pp) * 40); g.globalAlpha = clamp(pp); photo(g, 0, 0, 480, 320, { smooth: 1 }); g.restore(); }
  // forward counter (problem colour while it climbs; frozen and grey when stopped)
  const stop = o.stopAt ?? 1e9, tt = Math.min(t, stop), n = Math.floor(14 * Math.exp(Math.max(0, tt - t0 - 2.2) * 0.9));
  if (t > t0 + 2.2) { const red = t < stop;
    g.save(); g.translate(x + w - 520, y + 610); chip(g, `↪ Reenviado ${Math.min(n, 99999).toLocaleString('es-ES')} veces`, 0, 0, { red, px: 26 }); g.restore(); }
  return { px: x + w - 520, py: y + 250 };
}

// ───────── scenes ─────────
function sceneHook(g, t) {
  const t0 = 0, z = lerp(1.12, 1, eo(seg(t, 0, 3))), cam = E.camera({ zoom: z, rot: t > at(1) ? 0 : 0.01 * Math.sin(t * 2) * seg(t, 3, 6) });
  stage(g, cam);
  const { px, py } = chatPanel(g, t, t0, { stopAt: at(1) });
  g.save(); g.translate(px + 360, py + 90); g.scale(1.5, 1.5); stamp(g, 'IA', 0, 0, PAL.red, seg(t, 6.3, 6.6)); g.restore();            // "…y es falsa" (l00)
  if (t > at(1)) {                                                             // freeze → the big question, then the promise
    g.setTransform(1, 0, 0, 1, 0, 0);
    const p = seg(t, at(1), at(1) + 0.4); g.fillStyle = `rgba(8,9,12,${0.85 * eo(p)})`; g.fillRect(0, 0, W, H);
    const q0 = seg(t, at(1) + 4.5, at(1) + 4.9), k = back(p, 1.4) * (1 - q0); g.save(); g.translate(W / 2, 470); g.scale(k, k); text(g, '?', 0, 120, 360, 800, PAL.accent, { align: 'center', fam: 'disp' }); g.restore();
    const q = seg(t, at(1) + 4.5, at(1) + 4.9);
    if (q > 0) {
      g.fillStyle = `rgba(8,9,12,${0.9 * q})`; g.fillRect(0, 0, W, H);
      ['Marca de agua', 'Historial', 'Tus ojos'].forEach((s, i) => popAt(g, t, at(1) + 4.3 + i * 0.6, W / 2 - 600 + i * 400, 380, () => {
        E.panel(g, -170, -90, 340, 180, { r: 20 }); text(g, `0${i + 1}`, -140, -36, 28, 600, PAL.accent, { fam: 'mono' }); text(g, s, -140, 30, 38, 600, PAL.text); }));
      popAt(g, t, at(1) + 9.5, W / 2, 640, () => chip(g, '+ método de 4 pasos · 30 segundos', 0, 0, { accent: true, px: 34, center: true }));
    }
  }
}
function sceneMark(g, t) {                    // capa 1: SynthID — a light pass reveals the hidden pattern
  const s0 = secStart(1), cam = E.camera({ x: W / 2 + lerp(-30, 30, seg(t, s0, secStart(2))), zoom: 1 });
  stage(g, cam); header(g, t, s0, 'CAPA 01', 'La marca de agua invisible');
  const rv = seg(t, s0 + 6, s0 + 8.5);
  photo(g, 120, 300, 780, 520, { dots: ss(rv) });
  if (rv > 0 && rv < 1) { g.save(); rr(g, 120, 300, 780, 520, 18); g.clip(); const x = 120 + rv * 900 - 60; const gr = g.createLinearGradient(x - 80, 0, x + 80, 0);
    gr.addColorStop(0, 'rgba(139,124,255,0)'); gr.addColorStop(0.5, 'rgba(180,170,255,.35)'); gr.addColorStop(1, 'rgba(139,124,255,0)'); g.fillStyle = gr; g.fillRect(x - 80, 300, 160, 520); g.restore(); }
  popAt(g, t, s0 + 9, 140, 840, () => chip(g, 'SynthID · detector público desde octubre', 0, 0, { accent: true, px: 26 }));
  // the trap: found = made by Google's tools; not found ≠ real
  const a = at(3);
  popAt(g, t, a + 3, 1000, 340, () => { E.panel(g, 0, 0, 800, 190, { r: 20, stroke: rgba(PAL.accent, 0.8) });
    text(g, '✓ Marca encontrada', 36, 74, 40, 700, PAL.accent); text(g, 'hecha con IA de Google o sus socios', 36, 132, 30, 500, PAL.dim); });
  popAt(g, t, a + 7, 1000, 570, () => { E.panel(g, 0, 0, 800, 230, { r: 20 });
    text(g, '— Sin marca', 36, 74, 40, 700, PAL.text); text(g, 'NO significa que sea real', 36, 136, 34, 700, PAL.text);
    text(g, 'solo que no la hizo esa herramienta', 36, 186, 28, 500, PAL.dim); });
}
function sceneHistory(g, t) {                 // capa 2: content credentials — the photo turns over to show its signed history
  const s0 = secStart(2), cam = E.camera({ zoom: lerp(1.04, 1, eo(seg(t, s0, s0 + 3))) });
  stage(g, cam); header(g, t, s0, 'CAPA 02', 'El historial de la foto');
  const fl = seg(t, s0 + 1.5, s0 + 2.3), sx = Math.abs(Math.cos(fl * Math.PI)), back_ = fl > 0.5;
  const lost = seg(t, at(5) + 9.5, at(5) + 10.5);
  g.save(); g.translate(510, 560); g.scale(Math.max(0.02, sx), 1);
  if (!back_) photo(g, -390, -260, 780, 520);
  else {
    E.panel(g, -390, -260, 780, 520, { r: 18 });
    text(g, 'CREDENCIALES DE CONTENIDO', -350, -200, 22, 600, PAL.accent, { fam: 'mono' });
    [['Creada con', 'Cámara del móvil'], ['Fecha', '14 oct · 19:42'], ['Ediciones', 'recorte, brillo'], ['Firma', 'verificada ✓']].forEach(([k, v], i) => {
      const yy = -130 + i * 84; g.save(); g.globalAlpha = 1 - lost * (0.6 + 0.4 * hash(i)); g.translate((hash(i * 3) - 0.5) * 300 * lost, lost * lost * 200 * (1 + i));
      g.fillStyle = 'rgba(255,255,255,.04)'; rr(g, -350, yy - 44, 700, 66, 12); g.fill();
      text(g, k, -326, yy, 28, 500, PAL.dim); text(g, v, -60, yy, 30, 600, i === 3 ? PAL.accent : PAL.text); g.restore(); });
  }
  g.restore();
  ['Buscador', 'Chrome'].forEach((s, i) => popAt(g, t, at(5) + 3 + i * 0.6, 1020, 330 + i * 100, () => chip(g, s + ' · próximamente', 0, 0, { px: 30 })));
  popAt(g, t, at(5) + 7, 1020, 560, () => chip(g, 'Aún no está en todas partes', 0, 0, { px: 30 }));
  popAt(g, t, at(5) + 9.5, 1020, 660, () => chip(g, 'Captura de pantalla = historial perdido', 0, 0, { red: true, px: 30 }));
}
function sceneEyes(g, t) {                    // capa 3: what you can see — a lens visits four tells
  const s0 = secStart(3); const cam = E.camera({ zoom: 1 });
  stage(g, cam); header(g, t, s0, 'CAPA 03', 'Las pistas que ves tú');
  const X = 120, Y = 300, PW = 900, PH = 560;
  photo(g, X, Y, PW, PH, { smooth: 1 });
  // a sign with gibberish (tell #1)
  g.fillStyle = '#2A2238'; rr(g, X + 620, Y + 330, 220, 70, 8); g.fill(); text(g, 'SÙNET PLAJA', X + 640, Y + 376, 28, 700, '#E8C9A0', { fam: 'mono' });
  const tells = [['Textos sin sentido', X + 730, Y + 365, s0 + 3.0], ['Sombras imposibles', X + 330, Y + 520, s0 + 4.6], ['Piel de plástico', X + 306, Y + 360, s0 + 6.0], ['Manos, orejas, pendientes', X + 340, Y + 450, s0 + 7.4]];
  const cur = tells.reduce((c, tl, i) => t >= tl[3] ? i : c, -1);
  tells.forEach(([s, x, y, t1], i) => { if (t < t1) return;
    popAt(g, t, t1, 1080, 330 + i * 100, () => chip(g, s, 0, 0, { px: 30, accent: i === cur })); });
  if (cur >= 0 && t < at(7)) { const [, x, y, t1] = tells[cur], prev = tells[Math.max(0, cur - 1)], m = eio(seg(t, t1 - 0.4, t1));
    const lx = lerp(prev[1], x, cur ? m : 1), ly = lerp(prev[2], y, cur ? m : 1);
    g.save(); g.strokeStyle = PAL.accent; g.lineWidth = 6; g.shadowColor = rgba(PAL.accent, 0.8); g.shadowBlur = 20;
    g.beginPath(); g.arc(lx, ly, 64, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(lx + 46, ly + 46); g.lineTo(lx + 100, ly + 100); g.stroke(); g.restore(); }
  // proof → clue
  const a = at(7);
  if (t > a) { const p = seg(t, a + 0.2, a + 0.6), k = seg(t, a + 3.3, a + 3.7);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(8,9,12,${0.85 * eo(p)})`; g.fillRect(0, 0, W, H); g.restore();
    text(g, 'PRUEBA', W / 2, 520, 140, 800, PAL.text, { align: 'center', fam: 'disp', alpha: p });
    if (k > 0) { g.save(); g.strokeStyle = PAL.red; g.lineWidth = 14; g.beginPath(); g.moveTo(W / 2 - 300, 470); g.lineTo(W / 2 - 300 + 600 * eo(k), 470); g.stroke(); g.restore();
      popAt(g, t, a + 4, W / 2, 660, () => text(g, 'PISTA', 0, 40, 120, 800, PAL.accent, { align: 'center', fam: 'disp' })); }
  }
}
const STEPS = [['Para', 'si te enfada o asusta, desconfía'], ['Busca el origen', 'búsqueda inversa · ¿quién la publicó?'], ['Detector', 'marca de agua y credenciales'], ['Pistas', 'textos, sombras, manos']];
function sceneMethod(g, t) {                  // the 4-step method: tiles snap in, each lights on its line
  const s0 = secStart(4), cam = E.camera({ zoom: lerp(0.95, 1, eo(seg(t, s0, s0 + 4))) });
  stage(g, cam); header(g, t, s0, 'EL MÉTODO', '4 pasos, 30 segundos');
  const all = t > at(13);
  STEPS.forEach(([a, b], i) => {
    const ti = s0 + 1 + i * 0.3, p = seg(t, ti, ti + 0.55);
    const f = E.flyPose({ x: W / 2 + (i - 1.5) * 900, y: 1400, rot: (i - 1.5) * 0.4, s: 0.6 }, { x: 330 + i * 420, y: 560, rot: 0, s: 1 }, p);
    const lit = all || (t >= at(9 + i) && t < (i < 3 ? at(10 + i) : at(13)));
    g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.scale(f.s, f.s);
    if (lit) E.glow(g, 0, 0, 300, PAL.accent, 0.16);
    E.panel(g, -190, -200, 380, 400, { r: 22, stroke: lit ? rgba(PAL.accent, 0.9) : PAL.line });
    text(g, String(i + 1), -150, -70, 110, 700, lit ? PAL.accent : PAL.mute, { fam: 'disp' });
    text(g, a, -150, 20, 40, 700, PAL.text);
    g.font = font(26, 500); let line = '', yy = 76; for (const w of b.split(' ')) { const tt = line ? line + ' ' + w : w; if (g.measureText(tt).width > 310 && line) { text(g, line, -150, yy, 26, 500, PAL.dim); line = w; yy += 36; } else line = tt; } text(g, line, -150, yy, 26, 500, PAL.dim);
    g.restore();
  });
  popAt(g, t, at(13) + 2.4, W / 2, 830, () => chip(g, 'Si dudas, no la compartas', 0, 0, { accent: true, px: 36, center: true }));
}
function sceneEnd(g, t) {                     // echo: the same chat, the photo tagged, the counter stopped
  const s0 = secStart(5), cam = E.camera({ zoom: 1 });
  stage(g, cam);
  const { px, py } = chatPanel(g, 999, 999 - 9.6, { stopAt: 999 - 9.6 + 9.56 });   // same frozen count as the hook
  popAt(g, t, s0 + 0.8, px + 20, py + 20, () => chip(g, '⚠ Sin verificar', 0, 0, { px: 28, accent: true }));
  const e = seg(t, L[L.length - 1].t1 + 0.2, L[L.length - 1].t1 + 0.7);
  if (e > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(8,9,12,${0.94 * eo(e)})`; g.fillRect(0, 0, W, H);
    const q = back(e, 1.3); g.save(); g.translate(W / 2, H / 2); g.scale(q, q);
    text(g, 'IA Sin Rollos', -20, 30, 110, 700, PAL.text, { align: 'center', fam: 'disp' });
    g.font = font(110, 700, 'disp'); E.caret(g, g.measureText('IA Sin Rollos').width / 2 + 10, -8, 110, { on: Math.floor(t * 2) % 2 ? 0.25 : 1 });
    text(g, 'un truco de IA cada semana', 0, 110, 32, 500, PAL.dim, { align: 'center' }); g.restore(); }
}

const SCENES = [sceneHook, sceneMark, sceneHistory, sceneEyes, sceneMethod, sceneEnd];
export function renderFilm(g, t, o = {}) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  let k = 0; for (let s = 1; s < SCENES.length; s++) if (t >= secStart(s)) k = s;
  if (k > 0 && t < secStart(k) + 0.4) { SCENES[k - 1](g, t); g.setTransform(1, 0, 0, 1, 0, 0); }
  const clipped = k > 0 && expandClip(g, t, secStart(k), 160, 190);
  SCENES[k](g, t); g.setTransform(1, 0, 0, 1, 0, 0);
  if (clipped) g.restore();
  E.vignette(g, 0.5);
  if (!o.nosub && t < L[L.length - 1].t1 + 0.2) for (const c of SUBS) if (t >= c.t0 && t < c.t1) E.toast(g, c.text, seg(t, c.t0, c.t0 + 0.16), { px: 38 });
}
export function texts(t) { return SUBS.filter(c => t >= c.t0 && t < c.t1).map(c => ({ id: 'sub' + c.t0, text: c.text, x0: 300, y0: 940, x1: 1620, y1: 1010 })); }
export function buildEvents() {
  const ev = [];
  [0.3, 0.8, 1.6].forEach(t => ev.push({ t, type: 'pop' }));
  for (let i = 0; i < 30; i++) ev.push({ t: 2.4 + i * 0.22, type: 'scatter', i });
  ev.push({ t: 6.3, type: 'stamp' }); ev.push({ t: at(1), type: 'freeze' });
  [0, 1, 2].forEach(i => ev.push({ t: at(1) + 4.3 + i * 0.6, type: 'snap', i })); ev.push({ t: at(1) + 9.5, type: 'confirm' });
  for (let s = 1; s < 6; s++) ev.push({ t: secStart(s) - 0.04, type: 'whoosh' });
  const s1 = secStart(1); ev.push({ t: s1 + 6, type: 'sweep' }); ev.push({ t: s1 + 9, type: 'pop' }); ev.push({ t: at(3) + 3, type: 'confirm' }); ev.push({ t: at(3) + 7, type: 'pop' });
  ev.push({ t: secStart(2) + 1.5, type: 'whoosh' }); [3, 3.6, 7].forEach(d => ev.push({ t: at(5) + d, type: 'pop' })); ev.push({ t: at(5) + 9.5, type: 'break' });
  const s3 = secStart(3); [3, 4.6, 6, 7.4].forEach(d => ev.push({ t: s3 + d, type: 'pop' })); ev.push({ t: at(7) + 3.3, type: 'mark' }); ev.push({ t: at(7) + 4, type: 'lock' });
  const s4 = secStart(4); [0, 1, 2, 3].forEach(i => ev.push({ t: s4 + 1.4 + i * 0.3, type: 'snap', i })); [9, 10, 11, 12].forEach((l, i) => ev.push({ t: at(l), type: 'tick', i }));
  ev.push({ t: at(13), type: 'confirm' }); ev.push({ t: secStart(5) + 0.8, type: 'pop' }); ev.push({ t: L[L.length - 1].t1 + 0.2, type: 'end' });
  SUBS.forEach(c => ev.push({ t: c.t0, t1: c.t1, type: 'sub', text: c.text }));   // tools/srt.py writes the .srt from these
  return ev.sort((a, b) => a.t - b.t);
}
