// brand.js — channel avatar (800×800) and banner (2560×1440, text inside the 1546×423 safe area).
import * as E from './engine.js';
const { font, rr, rgba, PAL } = E;
function stage(g, w, h) {
  g.fillStyle = PAL.bg0; g.fillRect(0, 0, w, h);
  const gr = g.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h) * 0.7); gr.addColorStop(0, '#1A1C2C'); gr.addColorStop(1, 'rgba(10,11,15,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 1; g.beginPath();
  for (let x = 0; x <= w; x += 48) { g.moveTo(x + .5, 0); g.lineTo(x + .5, h); } for (let y = 0; y <= h; y += 48) { g.moveTo(0, y + .5); g.lineTo(w, y + .5); } g.stroke();
}
export function avatar(g) {          // a chat bubble with the cursor inside: reads at 98 px in a circle
  const S = 800; stage(g, S, S); E.glow(g, 400, 400, 420, PAL.accent, 0.22);
  g.save(); g.shadowColor = rgba(PAL.accent, 0.7); g.shadowBlur = 60; g.fillStyle = PAL.accent;
  rr(g, 170, 210, 460, 320, 90); g.fill(); g.beginPath(); g.moveTo(260, 500); g.lineTo(220, 620); g.lineTo(360, 520); g.fill(); g.restore();
  g.fillStyle = '#0E0F18'; g.font = font(150, 800, 'disp'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('IA', 370, 372);
  g.fillStyle = '#0E0F18'; rr(g, 470, 300, 22, 145, 8); g.fill();
}
export function banner(g) {
  const w = 2560, h = 1440; stage(g, w, h); E.glow(g, w / 2, h / 2, 900, PAL.accent, 0.12);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = PAL.text; g.font = font(150, 800, 'disp'); g.fillText('IA Sin Rollos', w / 2 - 20, 720);
  const tw = g.measureText('IA Sin Rollos').width; E.caret(g, w / 2 + tw / 2 + 10, 668, 150);
  g.fillStyle = PAL.dim; g.font = font(54, 500); g.fillText('Trucos de inteligencia artificial que puedes usar hoy', w / 2, 820);
  g.fillStyle = PAL.accent; g.font = font(34, 600, 'mono'); g.fillText('NUEVO VÍDEO CADA SEMANA', w / 2, 905);
  // faint UI cards at the sides: decoration outside the safe area (only shows on TV / desktop)
  [[260, 380, 420, 260], [1880, 820, 440, 240], [300, 860, 360, 200], [1900, 360, 380, 220]].forEach(([x, y, cw, ch], i) => {
    E.panel(g, x, y, cw, ch, { r: 24, alpha: 0.55 });
    for (let j = 0; j < 4; j++) { g.fillStyle = j === 0 && i % 2 ? rgba(PAL.accent, 0.5) : 'rgba(160,168,184,.18)'; rr(g, x + 30, y + 40 + j * 42, (cw - 60) * (0.5 + E.hash(i * 9 + j) * 0.5), 14, 7); g.fill(); }
  });
}
