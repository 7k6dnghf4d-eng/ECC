// IA Sin Rollos · edición especial GTA 6 — Broadcast News Package, Canvas 2D, deterministic render(t).
// Package parts adapted from the style's demo (MIT): plate/sting→bug, rundown opened and ticked, one strap, split-flap, stamps, band wipes.
// No game art, logos or characters: every graphic is drawn here. No burned-in subtitles (sidecar .srt from EV 'sub').
const W = 1920, H = 1080;
const cv = document.getElementById('out'); const ctx = cv.getContext('2d');
const C = { ink: '#121417', ink2: '#1B1E23', ink3: '#22262C', line: '#454B55', acc: '#8B7CFF', accL: '#A99DFF', accD: '#6A5BE0', gold: '#D4B064', paper: '#F4F1E8', white: '#FFFFFF', grey: '#C9CCD2', grey2: '#7D838D', olive: '#6E5A1E' };
const F = { b8: s => `800 ${s}px Barlow`, b6: s => `600 ${s}px Barlow`, b6i: s => `italic 600 ${s}px Barlow`, mono: s => `500 ${s}px Plex` };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, back = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

const OFF = 1.3;                       // narration starts after the sting
let L = [], SUBS = [], DUR = 130;
const at = i => L[i].t0 + OFF, endOf = i => L[i].t1 + OFF;
const sec = s => L.find(l => l.sec === s).t0 + OFF - 0.35;   // a story starts just before its first line

let TX = [];
function text(s, x, y, font, color, align = 'left', ls = 0, id = null) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y);
  const w = ctx.measureText(s).width; ctx.letterSpacing = '0px';
  if (id) { const m = ctx.getTransform(), fs = parseInt(font.match(/(\d+)px/)[1]), x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    const p0 = m.transformPoint({ x: x0, y: y - fs }), p1 = m.transformPoint({ x: x0 + w, y: y + 8 });
    TX.push({ id, text: s, x0: Math.min(p0.x, p1.x), y0: Math.min(p0.y, p1.y), x1: Math.max(p0.x, p1.x), y1: Math.max(p0.y, p1.y) }); }
  return w;
}
const tw = (s, font, ls = 0) => { ctx.font = font; ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; };

// —— brand plate (sting = bug = end card) ——
function plate(cx, cy, s, glint = -1, drop = 1) {
  const w = 520 * s, h = 180 * s, k = h * .28;
  ctx.save(); ctx.translate(cx, cy);
  const path = new Path2D(); path.moveTo(-w / 2 + k, -h / 2); path.lineTo(w / 2 + k, -h / 2); path.lineTo(w / 2 - k, h / 2); path.lineTo(-w / 2 - k, h / 2); path.closePath();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, C.accL); g.addColorStop(1, C.accD); ctx.fillStyle = g; ctx.fill(path);
  ctx.save(); ctx.clip(path); const gx = -w / 2 - k;
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx + 2 * k, -h / 2); ctx.lineTo(gx + 2 * k + w * .085, -h / 2); ctx.lineTo(gx + w * .085, h / 2); ctx.lineTo(gx, h / 2); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(gx + 2 * k + w * .085, -h / 2); ctx.lineTo(gx + 2 * k + w * .11, -h / 2); ctx.lineTo(gx + w * .11, h / 2); ctx.lineTo(gx + w * .085, h / 2); ctx.fill();
  ctx.font = F.b8(h * .8); ctx.textAlign = 'left'; let x = -w * .22;
  ['I', 'S', 'R'].forEach((ch, i) => { const d = clamp(drop * 3 - i); ctx.save(); ctx.globalAlpha *= clamp(d * 3); ctx.fillStyle = C.ink; ctx.fillText(ch, x, h * .29 + (1 - eo(d)) * -h * 1.1); ctx.restore(); x += ctx.measureText(ch).width + h * .04; });
  if (glint >= 0 && glint <= 1) { const g2 = lerp(-w, w, glint), gg = ctx.createLinearGradient(g2 - 80 * s, 0, g2 + 80 * s, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.6)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.fillRect(-w, -h, w * 2, h * 2); }
  ctx.restore(); ctx.restore();
}
function wordmark(x, y, size, align = 'center') {
  const parts = [['IA ', C.acc], ['SIN ROLLOS', C.white]], ls = size * .1, tot = parts.reduce((a, [s]) => a + tw(s, F.b8(size), ls), 0);
  let cx = align === 'center' ? x - tot / 2 : x; for (const [s, c] of parts) cx += text(s, cx, y, F.b8(size), c, 'left', ls);
}
function studioBg(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(1300, 380, 60, 1300, 380, 1100); rg.addColorStop(0, 'rgba(139,124,255,.16)'); rg.addColorStop(1, 'rgba(139,124,255,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { const x = ((i * 380 + t * (30 + i * 6)) % 2600) - 400, w = 40 + hash(i) * 120; ctx.fillStyle = `rgba(139,124,255,${.025 + hash(i + 9) * .035})`;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w - 500, H); ctx.lineTo(x - 500, H); ctx.fill(); }
  ctx.fillStyle = 'rgba(244,241,232,.05)'; for (let x = 40 - (t * 12) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
}
function tab(x, y, s, h = 50, px = 30) { const w = 40 + tw(s, F.b8(px), 2); ctx.fillStyle = C.acc; ctx.fillRect(x, y, w, h); text(s, x + 20, y + h * .74, F.b8(px), C.ink, 'left', 2); return w; }
function stamp(t, t0, x, y, s1, s2) {
  const sk = seg(t, t0, t0 + .16); if (sk <= 0) return;
  const w = Math.max(tw(s1, F.b8(52), 3), s2 ? tw(s2, F.mono(20), 2) : 0) + 80, h = s2 ? 130 : 100;
  const s = 1 + .9 * (1 - eo(sk)); ctx.save(); ctx.translate(x, y); ctx.rotate(-.12); ctx.scale(s, s); ctx.globalAlpha = clamp(sk * 3);
  ctx.fillStyle = 'rgba(18,20,23,.94)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20); ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36);
  text(s1, 0, s2 ? 6 : 18, F.b8(52), C.acc, 'center', 3); if (s2) text(s2, 0, 40, F.mono(20), C.paper, 'center', 2); ctx.restore();
  const rr = seg(t, t0 + .05, t0 + .5); if (rr < 1) { ctx.strokeStyle = `rgba(139,124,255,${.8 * (1 - rr)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, w / 2 + rr * 160, h / 2 + rr * 60, -.12, 0, Math.PI * 2); ctx.stroke(); }
}
function flipTile(x, y, w, h, from, to, t0, t, font, col) {
  const p = from === null ? 1 : seg(t, t0, t0 + .26);
  const half = (s, top, sc = 1) => { if (s === null) return; ctx.save(); ctx.beginPath(); ctx.rect(x, top ? y : y + h / 2, w, h / 2); ctx.clip();
    ctx.translate(0, y + h / 2); ctx.scale(1, sc); ctx.translate(0, -(y + h / 2)); ctx.fillStyle = top ? '#2B3038' : '#262A31'; ctx.fillRect(x, y, w, h); text(s, x + w / 2, y + h * .76, font, col, 'center'); ctx.restore(); };
  if (p >= 1) { half(to, true); half(to, false); } else if (p <= 0) { half(from, true); half(from, false); }
  else { half(to, true); half(from, false); if (p < .5) half(from, true, 1 - p * 2); else half(to, false, (p - .5) * 2); }
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x, y + h / 2 - 1.5, w, 3);
}
const board = (x, y, w, h, s, t, t0, font, col) => { [...s].forEach((ch, i) => flipTile(x + i * (w + 8), y, w, h, t < t0 + i * .07 ? ' ' : ' ', ch, t0 + i * .07, t, font, col)); };
function card(x, y, w, h, eyebrow, title, sub, k) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k * 3);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 12, y + 14, w, h); ctx.fillStyle = C.ink2; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.acc; ctx.fillRect(x, y, w, 6);
  text(eyebrow, x + 32, y + 50, F.mono(18), C.gold, 'left', 2); text(title, x + 32, y + 118, F.b8(56), C.white, 'left', 1); if (sub) text(sub, x + 32, y + 162, F.b6(28), C.grey, 'left', 1);
  ctx.restore();
}

// —— strap, source line, bug ——
let STRAP = [], SRC = [];
function strap(t) {
  if (t < sec(1) || t >= sec(5) + 0.3) return;
  let S = STRAP[0]; for (const it of STRAP) if (t >= it.a) S = it;
  const x0 = 96, ty = 856, by = 904, bh = 104, bw = 1250;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x0 + 8, by + 8, bw, bh); ctx.fillStyle = C.paper; ctx.fillRect(x0, by, bw, bh); ctx.fillStyle = C.acc; ctx.fillRect(x0, by, 14, bh);
  ctx.fillStyle = C.ink; ctx.fillRect(x0 + bw, by, 120, bh); ctx.fillStyle = C.acc; ctx.fillRect(x0 + bw, by, 120, 6); text('ISR', x0 + bw + 60, by + 68, F.b8(40), C.acc, 'center', 1);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 14, by, bw - 14, bh); ctx.clip(); text(S.h, x0 + 44, by + 66, F.b8(52), C.ink, 'left', .5, 'strap'); ctx.restore();
  tab(x0, ty, S.tab, by - ty);
}
function source(t) { const R = SRC.find(r => t >= r[0] && t < r[1]); if (!R) return; ctx.save(); ctx.globalAlpha = .75; text(R[2], 1836, 962, F.mono(15), C.paper, 'right', .5); ctx.restore(); }
function bug(t) { if (t < 1.45 || t > DUR - 6.5) return; ctx.globalAlpha = .95; plate(1739, 86, .327); text('EDICIÓN ESPECIAL', 1650, 96, F.b8(24), C.white, 'right', 3); ctx.globalAlpha = 1; }

// —— shots ——
function shotSting(t) {
  studioBg(t);
  [[.04, .3, 22, -60], [.1, .36, 8, 40]].forEach(([a, b, h, dy]) => { const k = seg(t, a, b); if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.translate(960, 470 + dy); ctx.rotate(-.14); ctx.fillStyle = C.acc; ctx.fillRect(lerp(-1900, 1900, eio(k)) - 700, -h / 2, 1400, h); ctx.restore(); });
}
function stingLogo(t) {
  if (t > 1.5) return;
  const k = seg(t, .16, .42), fly = eio(seg(t, 1.12, 1.45)), shake = t > .42 && t < .7 ? Math.sin(t * 90) * 14 * (1 - seg(t, .42, .7)) : 0;
  const cx = lerp(960, 1739, fly) + shake, cy = lerp(450, 86, fly), s = lerp(back(k, 2.2), .327, fly);
  if (k > 0) plate(cx, cy, s, seg(t, .85, 1.12) || -1, seg(t, .3, .7));
  const r = seg(t, .42, .8); if (r > 0 && r < 1) { ctx.strokeStyle = `rgba(139,124,255,${1 - r})`; ctx.lineWidth = 6 * (1 - r) + 1; ctx.beginPath(); ctx.ellipse(960, 450, 300 + r * 700, 120 + r * 300, 0, 0, Math.PI * 2); ctx.stroke(); }
  const wa = seg(t, .5, .8), wo = 1 - seg(t, 1.05, 1.18);
  if (wa > 0 && wo > 0) { ctx.save(); ctx.globalAlpha = wo; ctx.beginPath(); ctx.rect(960 - 520 * eo(wa), 560, 1040 * eo(wa), 160); ctx.clip();
    wordmark(960, 640, 70); text('EDICIÓN ESPECIAL · 23 NOV 2026', 960, 690, F.mono(22), C.gold, 'center', 3); ctx.restore(); }
}
const ROWS = [['01', 'Así fue el lanzamiento', '19 NOV'], ['02', 'Las cifras', 'SENSOR TOWER'], ['03', 'Las curiosidades más locas', 'CNN · VANDAL'], ['04', '4 consejos para empezar', 'SIN SPOILERS']];
function rundown(t, close) {
  studioBg(t); ctx.save(); ctx.translate(0, 110);
  const A0 = close ? 0 : 1.6, m = (a, b) => close ? 1 : eo(seg(t, a, b));
  const x = 120, ta = m(A0, A0 + .25);
  if (ta > .9) tab(x, 170, close ? 'REPASO' : 'HOY EN EL ESPECIAL');
  const r = (y, h, k, fn) => { if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, 800, h + 24); ctx.clip(); ctx.translate(0, (1 - k) * (h + 24)); fn(); ctx.restore(); };
  r(390, 170, m(2.0, 2.3), () => text('GTA 6', x - 6, 390, F.b8(180), C.white, 'left', 2, 'rdate'));
  r(480, 90, m(2.2, 2.5), () => text('4 DÍAS DESPUÉS', x, 480, F.b8(76), C.acc, 'left', 4, 'rmon'));
  ctx.globalAlpha = m(2.5, 2.8); text('A LA VENTA DESDE EL 19 NOV', x, 532, F.mono(22), C.gold, 'left', 3, 'rwk'); ctx.globalAlpha = 1;
  const X0 = 800, RW = 1024, RH = 120, rowT = [3.0, 6.0, 7.6, 9.6].map(v => v + OFF - 1.3);
  ROWS.forEach(([n, s, d], i) => {
    const a = close ? 0 : rowT[i], y = 150 + i * 140, k = close ? 1 : seg(t, a, a + .3); if (k <= 0) return;
    ctx.save(); ctx.translate(0, y); ctx.scale(1, Math.max(.02, close ? 1 : back(k, 2.0))); ctx.translate(0, -y);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(X0 + 10, y + 10, RW, RH); ctx.fillStyle = C.ink2; ctx.fillRect(X0, y, RW, RH); ctx.fillStyle = C.acc; ctx.fillRect(X0, y, 140, RH);
    text(n, X0 + 70, y + 90, F.b8(84), C.ink, 'center'); text(s, X0 + 176, y + 78, F.b8(52), C.white, 'left', .5, 'row' + i); text(d, X0 + RW - 26, y + 96, F.mono(18), C.grey2, 'right', 2);
    if (close) { const ck = seg(t, .4 + i * .4, .62 + i * .4); if (ck > 0) { const s2 = back(ck, 2.6); ctx.save(); ctx.translate(X0 + RW - 64, y + 44); ctx.scale(s2, s2);
      ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-13, 1); ctx.lineTo(-3, 11); ctx.lineTo(15, -10); ctx.stroke(); ctx.restore(); } }
    ctx.restore();
  });
  ctx.restore();
}
function shotLaunch(t) {                // story 1: the release rolled across time zones, midnight local
  studioBg(t); ctx.save(); ctx.translate(0, 60);
  const a = at(1), k = seg(t, a - .1, a + .2);
  ctx.globalAlpha = k; text('LANZAMIENTO · INFOBAE · 18 NOV 2026', 120, 120, F.mono(20), C.gold, 'left', 3); ctx.globalAlpha = 1;
  ['1', '9'].forEach((c, i) => flipTile(120 + i * 150, 160, 140, 200, null, c, 0, 9, F.b8(170), C.white));
  text('NOV', 430, 340, F.b8(110), C.acc, 'left', 4); text('PS5 · XBOX SERIES', 120, 420, F.b6(34), C.grey, 'left', 3);
  // a strip of time zones lighting east → west, each at its own midnight
  const z0 = a + 4.5, cells = 24, cx0 = 120, cw = 66;
  text('00:00 HORA LOCAL, ZONA A ZONA', cx0, 520, F.mono(22), C.paper, 'left', 3);
  for (let i = 0; i < cells; i++) { const on = seg(t, z0 + i * .22, z0 + i * .22 + .15); const x = cx0 + i * (cw + 4);
    ctx.fillStyle = on > 0 ? `rgba(139,124,255,${.25 + .75 * on})` : C.ink3; ctx.fillRect(x, 545, cw, 120);
    if (i % 3 === 0) text(`+${12 - i}`, x + cw / 2, 700, F.mono(16), C.grey2, 'center', 1); }
  // story 1b: preload and PC
  const b = at(2); if (t > b - .2) {
    card(1100, 120, 680, 190, 'DESCARGA ANTICIPADA', 'Desde el 12 NOV', 'para quien lo reservó', eo(seg(t, b, b + .3)));
  }
  ctx.restore();
  stamp(t, b + 3.4, 1480, 420, 'PC: SIN FECHA', 'MILENIO');
}
function shotNumbers(t) {               // story 2: reservations (estimate) and the preload size
  studioBg(t); ctx.save(); ctx.translate(0, 60);
  const a = at(3);
  ctx.globalAlpha = seg(t, a - .1, a + .2); text('CIFRAS · SENSOR TOWER VÍA QUE.ES · 15 NOV 2026', 120, 120, F.mono(20), C.gold, 'left', 3); ctx.globalAlpha = 1;
  text('RESERVAS', 120, 200, F.b8(44), C.white, 'left', 3);
  board(120, 230, 150, 220, '11M', t, a + 1.2, F.b8(180), C.acc);
  text('aprox. · estimación de la consultora', 120, 510, F.b6(30), C.grey, 'left', 1);
  if (t > a + 5.5) { const k = eo(seg(t, a + 5.5, a + 5.8)); ctx.globalAlpha = k;
    text('DÍA 1, ESTIMACIONES', 760, 200, F.b8(44), C.white, 'left', 3); text('hasta', 760, 320, F.b6(48), C.grey, 'left', 1);
    board(900, 230, 150, 220, '25M', t, a + 5.7, F.b8(180), C.white); ctx.globalAlpha = 1; }
  const b = at(4); if (t > b - .2) { const k = eo(seg(t, b, b + .35));
    card(120, 580, 1100, 200, 'PREINSTALACIÓN · INFOBAE', '', '', k);
    if (k > 0) { ctx.globalAlpha = k; text('212', 160, 740, F.b8(150), C.acc, 'left', 1); text('GB', 160 + tw('212', F.b8(150), 1) + 20, 740, F.b8(80), C.white, 'left', 2);
      const bw = 500 * eo(seg(t, b + .4, b + 1.4)); ctx.fillStyle = C.ink3; ctx.fillRect(620, 690, 500, 34); ctx.fillStyle = C.acc; ctx.fillRect(620, 690, bw, 34);
      text(`${Math.round(212 * bw / 500)} / 212 GB`, 620, 760, F.mono(20), C.grey, 'left', 2); ctx.globalAlpha = 1; } }
  ctx.restore();
}
function shotCurios(t) {                // story 3: four cards land, one per curiosity
  studioBg(t); ctx.save(); ctx.translate(0, 60);
  const items = [[at(5) + 1.6, 'SEGÚN CNN', 'Logitech: día libre', 'para sus empleados'], [at(6), 'SEGÚN CNN', 'Xbox → Nueva Zelanda', 'para jugar horas antes'],
    [at(7), 'SEGÚN VANDAL', 'Aviso de la Policía', 'imitarlo tiene consecuencias'], [at(7) + 7.5, 'SEGÚN VANDAL', 'Sin modo 60 fps', 'ni siquiera en PS5 Pro']];
  items.forEach(([t0, e, h, s], i) => { const k = seg(t, t0, t0 + .45); if (k <= 0) return; const q = back(k, 1.4);
    const x = 120 + (i % 2) * 860, y = 120 + Math.floor(i / 2) * 330;
    ctx.save(); ctx.translate(x + 380, y + 100); ctx.rotate((1 - eo(k)) * (i % 2 ? .3 : -.3)); ctx.scale(lerp(.1, 1, q), lerp(.1, 1, q)); ctx.translate(-x - 380, -y - 100);
    card(x, y, 760, 200, e, h, s, 1); ctx.restore(); });
  ctx.restore();
  const w = at(6) + 6.6; if (t > w) { ctx.save(); ctx.translate(980 + 380, 180 + 250); const k = back(seg(t, w, w + .25), 1.6); ctx.scale(k, k);
    ctx.fillStyle = 'rgba(254,107,61,.16)'; ctx.strokeStyle = '#FE6B3D'; ctx.lineWidth = 2; const s = '⚠ CONTRA LAS CONDICIONES DE USO', ww = tw(s, F.b8(26), 2) + 40;
    ctx.fillRect(-ww / 2, -26, ww, 52); ctx.strokeRect(-ww / 2, -26, ww, 52); text(s, 0, 9, F.b8(26), '#FE6B3D', 'center', 2); ctx.restore(); }
}
const TIPS = [['Modo concentración', 'pulsa los dos joysticks', 'PLAYNIUS'], ['No guardes dinero', 'se pierde al acabar el cap. 1', 'PLAYNIUS'], ['Silenciador pronto', 'misiones más discretas', 'EL PLURAL'], ['Come, duerme, dúchate', 'mejoras temporales', 'ENDGAMETOOLS']];
function shotTips(t) {                  // story 4: four rows, each lights on its line
  studioBg(t); ctx.save(); ctx.translate(0, 40);
  const a = at(8); ctx.globalAlpha = seg(t, a - .1, a + .2); text('CONSEJOS · SEGÚN LAS GUÍAS DE LOS PRIMEROS DÍAS', 120, 120, F.mono(20), C.gold, 'left', 3); ctx.globalAlpha = 1;
  TIPS.forEach(([h, s, src], i) => {
    const t0 = a + .6 + i * .25, k = seg(t, t0, t0 + .3); if (k <= 0) return;
    const lit = t >= at(9 + i) && (i === 3 || t < at(10 + i)), y = 160 + i * 168;
    ctx.save(); ctx.translate(0, y); ctx.scale(1, Math.max(.02, back(k, 2))); ctx.translate(0, -y);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(130, y + 10, 1200, 140); ctx.fillStyle = lit ? '#262247' : C.ink2; ctx.fillRect(120, y, 1200, 140);
    ctx.fillStyle = lit ? C.acc : C.ink3; ctx.fillRect(120, y, 150, 140); text(String(i + 1), 195, y + 106, F.b8(96), lit ? C.ink : C.grey2, 'center');
    text(h, 300, y + 72, F.b8(56), C.white, 'left', .5); text(s, 300, y + 116, F.b6(30), C.grey, 'left', 1); text(src, 1300, y + 116, F.mono(16), C.grey2, 'right', 2);
    if (lit && i === 0) ['L3', '+', 'R3'].forEach((c, j) => { const x = 1420 + j * 120; if (c === '+') text(c, x + 30, y + 92, F.b8(64), C.acc, 'center');
      else { ctx.strokeStyle = C.acc; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + 30, y + 70, 48, 0, Math.PI * 2); ctx.stroke(); text(c, x + 30, y + 86, F.b8(44), C.white, 'center'); } });
    ctx.restore();
  });
  ctx.restore();
  stamp(t, a + 2.2, 1600, 680, 'SIN SPOILERS');
}
function shotEnd(t) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1A1D22'); g.addColorStop(1, '#0E1013'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.acc; ctx.beginPath(); ctx.moveTo(1260, 0); ctx.lineTo(1290, 0); ctx.lineTo(1150, 790); ctx.lineTo(1120, 790); ctx.fill();
  const m = (a, b) => eo(seg(t, a, b)), x = 150;
  ctx.globalAlpha = m(.1, .3); text('IA SIN ROLLOS · EDICIÓN ESPECIAL · 23 NOV 2026', x, 210, F.mono(24), C.gold, 'left', 3); ctx.globalAlpha = m(.15, .45);
  text('GTA 6, cuatro días después', x - 4, 350, F.b8(110), C.white, 'left', 1, 'e1'); text('Suscríbete para la próxima edición', x, 440, F.b6i(56), C.acc, 'left', 1, 'e2');
  ctx.fillStyle = C.acc; ctx.fillRect(x, 482, 880 * eio(seg(t, .4, .7)), 2);
  ctx.globalAlpha = m(.8, 1.1); ctx.fillStyle = C.line; ctx.fillRect(x, 816, 1620, 1);
  ['Fuentes: Infobae · Milenio · Que.es (Sensor Tower) · CNN en Español · Vandal · Playnius · El Plural · Endgametools', 'Vídeo informativo no oficial, sin relación con Rockstar Games ni Take-Two. Gráficos originales dibujados en código.',
   'Voz: Kokoro (Apache 2.0) · Música y efectos originales · Fuentes tipográficas Barlow Condensed e IBM Plex Mono (OFL)'].forEach((s, i) => text(s, x, 860 + i * 34, F.b6(24), C.grey, 'left', .5));
  ctx.globalAlpha = m(.3, .6); plate(1600, 360, .62, seg(t, 1.0, 1.45) || -1, seg(t, .3, .8)); wordmark(1600, 520, 48); ctx.globalAlpha = 1;
}

// —— compositing: band wipes between stories, slanted wipe into the end card ——
function wipeBand(bx) { ctx.fillStyle = C.acc; ctx.fillRect(bx - 84, 0, 84, H); ctx.fillStyle = C.ink; ctx.fillRect(bx, 0, 5, H); ctx.fillStyle = C.gold; ctx.fillRect(bx + 5, 0, 14, H); }
function layer(fn, t, tov) { fn(t); source(tov); strap(tov); }
function wipe(t, a, b, oldFn, newFn) {
  const bx = lerp(-140, W + 140, eio(seg(t, a, b)));
  const n0 = TX.length; layer(newFn, t, b + .001); const NEW = TX.splice(n0);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, 0, W, H); ctx.clip(); layer(oldFn, t, a - .001); ctx.restore();
  const OLD = TX.splice(n0); TX.push(...(seg(t, a, b) < .5 ? OLD : NEW)); wipeBand(bx);
}
let SCENES = [], WIPES = [], END0 = 0;
function scene(t) {
  if (t < 1.5) { if (t >= 1.2) wipe(t, 1.2, 1.5, shotSting, SCENES[0][1]); else layer(shotSting, t, t); stingLogo(t); return; }
  const w = WIPES.find(([a, b]) => t >= a && t < b);
  if (w) { const i = SCENES.findIndex(s => Math.abs(s[0] - w[1]) < .01); wipe(t, w[0], w[1], SCENES[i - 1][1], SCENES[i][1]); return; }
  if (t >= END0 - .25 && t < END0) { layer(SCENES[SCENES.length - 1][1], t, t); const k = eio(seg(t, END0 - .25, END0)), x = W - k * (W + 340);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x + 340, 0); ctx.lineTo(W + 340, 0); ctx.lineTo(W + 340, H); ctx.lineTo(x, H); ctx.closePath(); ctx.clip(); shotEnd(t - END0 + .25); ctx.restore();
    ctx.fillStyle = C.acc; ctx.beginPath(); ctx.moveTo(x + 340, 0); ctx.lineTo(x + 380, 0); ctx.lineTo(x + 40, H); ctx.lineTo(x, H); ctx.fill(); return; }
  if (t >= END0) { shotEnd(t - END0 + .25); return; }
  let fn = SCENES[0][1]; for (const [a, f] of SCENES) if (t >= a) fn = f; layer(fn, t, t);
}
function render(t) { TX = []; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; scene(t); bug(t); if (t > DUR - .7) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DUR - .7, DUR)})`; ctx.fillRect(0, 0, W, H); } }

// —— boot ——
await Promise.all(['800 40px Barlow', '600 40px Barlow', 'italic 600 40px Barlow', '500 40px Plex'].map(f => document.fonts.load(f)));
L = await (await fetch('lines.json')).json();
const last = L[L.length - 1];
END0 = at(last.id === 'l13' ? 13 : L.length - 1) + 4.2;                 // recap under the sign-off line, then the end card
DUR = +(Math.max(endOf(L.length - 1) + 1.0, END0 + 4.5)).toFixed(2);
const RECAP = t => rundown(t - sec(5), true);
SCENES = [[1.5, t => rundown(t, false)], [sec(1), shotLaunch], [sec(2), shotNumbers], [sec(3), shotCurios], [sec(4), shotTips], [sec(5), RECAP]];
WIPES = SCENES.slice(1).map(([s]) => [s - .3, s]);
STRAP = [{ a: sec(1), tab: 'LANZAMIENTO', h: 'GTA 6 sale por zonas horarias, a medianoche local' }, { a: sec(2), tab: 'CIFRAS', h: 'Unos 11 millones de reservas, según Sensor Tower' },
  { a: sec(3), tab: 'CURIOSIDADES', h: 'Días libres, viajes a Nueva Zelanda y un aviso policial' }, { a: sec(4), tab: 'CONSEJOS', h: 'Cuatro consejos sin spoilers para tus primeras horas' }];
SRC = [[sec(1), sec(2), 'FUENTE: INFOBAE · MILENIO'], [sec(2), sec(3), 'FUENTE: QUE.ES (SENSOR TOWER) · INFOBAE'], [sec(3), sec(4), 'FUENTE: CNN EN ESPAÑOL · VANDAL'], [sec(4), sec(5), 'FUENTE: PLAYNIUS · EL PLURAL · ENDGAMETOOLS']];
// subtitles (sidecar only): each line in ≤ 9-word cues timed by word share
for (const l of L) { const w = l.text.split(' '), n = Math.max(1, Math.round(w.length / 9)); let t = l.t0 + OFF;
  for (let k = 0; k < n; k++) { const p = w.slice(Math.round(k * w.length / n), Math.round((k + 1) * w.length / n)), d = (l.t1 - l.t0) * p.length / w.length; SUBS.push({ t0: t, t1: t + d, text: p.join(' ') }); t += d; } }
const EV = [{ t: 0.16, type: 'sting' }, { t: 1.5, type: 'theme' }];
[3.0, 6.0, 7.6, 9.6].forEach(v => EV.push({ t: v, type: 'glock' }));
WIPES.forEach(([a]) => EV.push({ t: a, type: 'whoosh' })); SCENES.slice(1).forEach(([s], i) => EV.push({ t: s, type: 'timpani', i }));
EV.push({ t: at(3) + 1.2, type: 'flaps' }, { t: at(3) + 5.7, type: 'flaps' }, { t: at(2) + 3.4, type: 'stamp' }, { t: at(8) + 2.2, type: 'stamp' });
[at(5) + 1.6, at(6), at(7), at(7) + 7.5].forEach(v => EV.push({ t: v, type: 'paper' })); EV.push({ t: at(6) + 6.6, type: 'alert' });
[9, 10, 11, 12].forEach(i => EV.push({ t: at(i), type: 'tick', i })); [0, 1, 2, 3].forEach(i => EV.push({ t: sec(5) + .4 + i * .4, type: 'tick', i }));
EV.push({ t: END0 - .25, type: 'whoosh' }, { t: END0, type: 'tutti' });
SUBS.forEach(c => EV.push({ t: c.t0, t1: c.t1, type: 'sub', text: c.text }));
EV.push({ t: OFF, type: 'voice', off: OFF });
window.DUR = DUR; window.EV = EV.sort((a, b) => a.t - b.t); window.TEXTS = () => TX; window.render = render; window.READY = true;
