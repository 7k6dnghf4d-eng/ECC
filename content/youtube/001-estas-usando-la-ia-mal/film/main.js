import { renderFilm, setSubs, buildEvents, texts, DUR } from './film.js';
import { renderShort, shortDur } from './shorts.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all([400, 500, 600, 700].flatMap(w => [`${w} 40px Inter`, `${w} 40px InterTight`, `${w} 40px JBMono`]).map(f => document.fonts.load(f)));
setSubs(await (await fetch('subs.json')).json());
const Q = new URLSearchParams(location.search), short = Q.get('short');   // ?short=A|B|C → vertical cut
if (Q.has('thumb')) { const { renderThumb } = await import('./thumb.js'); window.DUR = 1; window.EV = []; window.render = () => renderThumb(g); }
else if (short) { cv.width = 1080; cv.height = 1920; window.DUR = shortDur(short); window.EV = []; window.render = t => renderShort(g, short, t); }
else { window.DUR = DUR; window.EV = buildEvents(); window.TEXTS = texts; window.render = t => renderFilm(g, t); }
window.READY = true;
