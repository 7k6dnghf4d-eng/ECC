import { renderFilm, setSubs, buildEvents, texts, DUR } from './film.js';
const g = document.getElementById('c').getContext('2d');
await Promise.all([400, 500, 600, 700].flatMap(w => [`${w} 40px Inter`, `${w} 40px InterTight`, `${w} 40px JBMono`]).map(f => document.fonts.load(f)));
setSubs(await (await fetch('subs.json')).json());
window.DUR = DUR;
window.EV = buildEvents();
window.TEXTS = texts;
window.render = t => renderFilm(g, t);
window.READY = true;
