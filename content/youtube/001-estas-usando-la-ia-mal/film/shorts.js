// shorts.js — vertical 1080×1920 cut of one trick: hook on top, the 16:9 scene in the middle, big captions below.
import { renderFilm, getSubs } from './film.js';
import * as E from './engine.js';
const { clamp, seg, back, eo, font, rr, rgba, PAL } = E;
export const SHORTS = {
  A: { t0: 141.0, t1: 160.6, hook: 'Añade esta frase al final de lo que le pides a la IA' },
  B: { t0: 184.7, t1: 217.3, hook: 'La IA te miente con total seguridad. Así la pillas' },
  C: { t0: 89.8, t1: 113.6, hook: 'Deja de leer muros de texto de la IA' },
};
const VW = 1080, VH = 1920, END = 1.6;
export const shortDur = k => +(SHORTS[k].t1 - SHORTS[k].t0 + END).toFixed(2);
function lines(g, s, maxW) { const out = []; let l = ''; for (const w of s.split(' ')) { const t = l ? l + ' ' + w : w; if (g.measureText(t).width > maxW && l) { out.push(l); l = w; } else l = t; } if (l) out.push(l); return out; }
export function renderShort(g, k, t) {
  const S = SHORTS[k], ft = S.t0 + Math.min(t, S.t1 - S.t0);
  const [c, cg] = E.buf('scene', 1920, 1080);
  renderFilm(cg, ft, { nosub: true });
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = PAL.bg0; g.fillRect(0, 0, VW, VH);
  const gr = g.createRadialGradient(VW / 2, 700, 0, VW / 2, 700, 1100); gr.addColorStop(0, rgba('#151822', 1)); gr.addColorStop(1, rgba('#0A0B0F', 0));
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  E.glow(g, VW / 2, 960, 700, PAL.accent, 0.06);
  // the scene, framed as a screen
  const sw = VW - 40, sh = sw * 1080 / 1920, sy = 640;
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 60; g.shadowOffsetY = 20; rr(g, 20, sy, sw, sh, 28); g.fillStyle = '#000'; g.fill(); g.restore();
  g.save(); rr(g, 20, sy, sw, sh, 28); g.clip(); g.drawImage(c, 20, sy, sw, sh); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.5; rr(g, 20.5, sy + 0.5, sw - 1, sh - 1, 28); g.stroke();
  // hook: the first thing people read; snaps in at frame 1 (no slow intro)
  const hp = back(seg(t, 0, 0.35), 1.3);
  g.font = font(76, 700); const hl = lines(g, S.hook, VW - 140);
  hl.forEach((l, i) => { g.save(); g.globalAlpha = clamp(hp * 1.5); g.fillStyle = i === hl.length - 1 ? PAL.accent : PAL.text; g.textAlign = 'center'; g.font = font(76, 700);
    g.fillText(l, VW / 2, 240 + i * 92 + (1 - hp) * 30 + (3 - hl.length) * 40); g.restore(); });
  g.save(); g.font = font(30, 600, 'mono'); g.fillStyle = PAL.mute; g.textAlign = 'center'; g.fillText('IA SIN ROLLOS', VW / 2, 120); g.restore();
  // captions: large, two lines max, under the screen
  const cue = getSubs().find(q => ft >= q.t0 && ft < q.t1 && t < S.t1 - S.t0);
  if (cue) {
    g.font = font(58, 600); const cl = lines(g, cue.text, VW - 160), a = eo(seg(ft, cue.t0, cue.t0 + 0.16));
    const h = cl.length * 74 + 50, y = 1360;
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(12,14,19,.82)'; rr(g, 60, y, VW - 120, h, 36); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1; rr(g, 60.5, y + 0.5, VW - 121, h - 1, 36); g.stroke();
    g.fillStyle = PAL.text; g.textAlign = 'center'; g.font = font(58, 600); cl.forEach((l, i) => g.fillText(l, VW / 2, y + 78 + i * 74)); g.restore();
  }
  // end card: follow
  const e = seg(t, S.t1 - S.t0, S.t1 - S.t0 + 0.4);
  if (e > 0) { g.save(); g.fillStyle = `rgba(8,9,12,${0.94 * eo(e)})`; g.fillRect(0, 0, VW, VH); const q = back(e, 1.3);
    g.translate(VW / 2, VH / 2); g.scale(q, q); g.textAlign = 'center'; g.fillStyle = PAL.text; g.font = font(96, 700, 'disp'); g.fillText('IA Sin Rollos', 0, 0);
    g.fillStyle = PAL.dim; g.font = font(44, 500); g.fillText('El vídeo completo, en el canal', 0, 90);
    g.font = font(96, 700, 'disp'); E.caret(g, g.measureText('IA Sin Rollos').width / 2 + 22, -34, 96, { on: Math.floor(t * 2) % 2 ? 0.25 : 1 }); g.restore(); }
}
