// thumb.js — thumbnail: the same photo twice, the right one stamped «IA», headline «¿REAL O IA?»
import * as E from './engine.js';
import { photo, stamp } from './film.js';
const { font, PAL, W } = E;
export function renderThumb(g) {
  E.bg(g, { lift: 1.2 }); E.grid(g);
  E.glow(g, 1420, 680, 520, PAL.red, 0.14);
  photo(g, 90, 400, 820, 546); photo(g, 1010, 400, 820, 546);
  g.save(); g.translate(1420, 673); g.scale(2.2, 2.2); stamp(g, 'IA', 0, 0, PAL.red, 1, -0.16); g.restore();
  g.save(); g.textAlign = 'center'; g.font = font(190, 800, 'disp'); g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 30;
  g.fillStyle = '#FFFFFF'; g.fillText('¿REAL', W / 2 - 250, 300); g.fillStyle = PAL.accent; g.fillText('O', W / 2 + 140, 300); g.fillStyle = PAL.red; g.fillText('IA?', W / 2 + 420, 300); g.restore();
  E.vignette(g, 0.4);
}
