import { renderFilm, setLines, buildEvents, texts } from './film.js';
import * as F from './film.js';
const g = document.getElementById('c').getContext('2d');
await Promise.all([400, 500, 600, 700, 800].flatMap(w => [`${w} 40px Inter`, `${w} 40px InterTight`, `${w} 40px JBMono`]).map(f => document.fonts.load(f)));
setLines(await (await fetch('lines.json')).json());
const Q = new URLSearchParams(location.search), short = Q.get('short');   // ?short=A|B|C → vertical cut
window.DUR = F.DUR; window.EV = buildEvents(); window.TEXTS = texts;
if (short) { const S = await import('./shorts.js'); g.canvas.width = 1080; g.canvas.height = 1920; window.DUR = S.shortDur(short); window.EV = []; window.TEXTS = undefined; }
window.render = short ? (await import('./shorts.js')).renderShort.bind(null, g, short) : Q.has('thumb') ? (await import('./thumb.js')).renderThumb.bind(null, g) : t => renderFilm(g, t);
window.READY = true;
