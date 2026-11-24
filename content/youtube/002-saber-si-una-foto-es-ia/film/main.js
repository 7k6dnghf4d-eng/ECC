import { renderFilm, setLines, buildEvents, texts } from './film.js';
import * as F from './film.js';
const g = document.getElementById('c').getContext('2d');
await Promise.all([400, 500, 600, 700, 800].flatMap(w => [`${w} 40px Inter`, `${w} 40px InterTight`, `${w} 40px JBMono`]).map(f => document.fonts.load(f)));
setLines(await (await fetch('lines.json')).json());
window.DUR = F.DUR; window.EV = buildEvents(); window.TEXTS = texts;
window.render = new URLSearchParams(location.search).has('thumb') ? (await import('./thumb.js')).renderThumb.bind(null, g) : t => renderFilm(g, t);
window.READY = true;
