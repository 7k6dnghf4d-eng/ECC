// thumb.js — YouTube thumbnail (rendered at 1920×1080, scaled to 1280×720): crossed-out red bubble vs green bubble, big headline.
import * as E from './engine.js';
const { font, rr, rgba, PAL, W, H } = E;
const RED = '#FF4D5E', GREEN = '#3DDC84';
function bubble(g, x, y, w, h, col, tail) {
  g.save(); g.shadowColor = rgba(col, 0.55); g.shadowBlur = 60;
  g.fillStyle = rgba(col, 0.16); rr(g, x, y, w, h, 48); g.fill();
  g.beginPath(); g.moveTo(x + tail, y + h - 4); g.lineTo(x + tail + (tail < w / 2 ? -40 : 40), y + h + 60); g.lineTo(x + tail + (tail < w / 2 ? 60 : -60), y + h - 4); g.fill();
  g.shadowColor = 'transparent'; g.strokeStyle = col; g.lineWidth = 6; rr(g, x, y, w, h, 48); g.stroke(); g.restore();
}
export function renderThumb(g) {
  E.bg(g, { lift: 1.2 }); E.grid(g, { ox: 0, oy: 0 });
  E.glow(g, 420, 600, 560, RED, 0.14); E.glow(g, 1500, 600, 560, GREEN, 0.14);
  // left: the bad answer, a wall of lines, crossed out
  bubble(g, 120, 440, 620, 400, RED, 120);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(200,205,215,.35)'; rr(g, 170, 490 + i * 36, 520 * (0.6 + E.hash(i) * 0.4), 14, 7); g.fill(); }
  g.save(); g.strokeStyle = RED; g.lineWidth = 26; g.lineCap = 'round'; g.shadowColor = rgba(RED, 0.8); g.shadowBlur = 30;
  g.beginPath(); g.moveTo(150, 470); g.lineTo(710, 810); g.moveTo(710, 470); g.lineTo(150, 810); g.stroke(); g.restore();
  // right: the good answer, short and clean, with a check
  bubble(g, 1180, 440, 620, 400, GREEN, 500);
  [['1.', 360], ['2.', 300], ['3.', 330]].forEach(([n, w], i) => { g.fillStyle = GREEN; g.font = font(48, 700); g.fillText(n, 1240, 540 + i * 100);
    g.fillStyle = 'rgba(232,234,240,.85)'; rr(g, 1310, 512 + i * 100, w, 22, 11); g.fill(); });
  g.save(); g.fillStyle = GREEN; g.shadowColor = rgba(GREEN, 0.9); g.shadowBlur = 40; g.beginPath(); g.arc(1760, 470, 70, 0, 7); g.fill();
  g.strokeStyle = '#0A0B0F'; g.lineWidth = 18; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(1725, 472); g.lineTo(1752, 500); g.lineTo(1800, 445); g.stroke(); g.restore();
  // headline, readable at phone size
  g.save(); g.textAlign = 'center'; g.font = font(150, 800, 'disp'); g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 30;
  g.fillStyle = '#FFFFFF'; g.fillText('LO ESTÁS', W / 2, 200); g.fillStyle = RED; g.fillText('HACIENDO MAL', W / 2, 350); g.restore();
  E.vignette(g, 0.45);
}
