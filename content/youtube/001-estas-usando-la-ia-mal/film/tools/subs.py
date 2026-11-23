"""Subtitle cues from guion.md + measured section starts in narracion.mp3 → subs.json.
shortcut: no ASR in this env, so words are spread evenly inside each section; swap for faster-whisper word timings when the model can be downloaded."""
import json, re, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = [0.25, 31.2, 60.0, 89.8, 113.8, 141.0, 160.8, 184.7, 217.5, 242.8]  # measured pauses; last = end of speech
md = open(os.path.join(HERE, '..', 'guion.md'), encoding='utf-8').read()
body = md.split('## Guion', 1)[1].split('## Descripción', 1)[0]
parts = re.split(r'^### .*$', body, flags=re.M)[1:]
assert len(parts) == len(SECS) - 1, len(parts)
cues = []
for i, p in enumerate(parts):
    txt = ' '.join(l for l in p.splitlines() if l.strip() and not l.startswith(('**[VISUAL', '>', '---')))
    txt = txt.replace('—', ',').replace('«', '').replace('»', '')
    sents = re.findall(r'[^.!?…]+[.!?…]*', txt)
    chunks = []
    for s in sents:                       # max ~7 words per toast so it fits one line
        w = s.split()
        n = max(1, round(len(w) / 7))
        step = len(w) / n
        chunks += [' '.join(w[round(k * step):round((k + 1) * step)]) for k in range(n)]
    merged = []
    for c in chunks:                      # glue fragments under 4 words onto the previous toast
        if merged and len(c.split()) < 4: merged[-1] += ' ' + c
        else: merged.append(c)
    chunks = merged
    total = sum(len(c.split()) for c in chunks)
    t, span = SECS[i], SECS[i + 1] - SECS[i] - 0.3
    for c in chunks:
        d = span * len(c.split()) / total
        cues.append({'t0': round(t, 2), 't1': round(t + d - 0.05, 2), 'text': c.strip(' ,')})
        t += d
# merge a toast shorter than 1.8 s into its neighbour (same section) while the line still fits (~72 chars)
sec = lambda c: max(i for i, x in enumerate(SECS) if x <= c['t0'] + 1e-6)
changed = True
while changed:
    changed = False
    for i, c in enumerate(cues):
        if c['t1'] - c['t0'] >= 1.8: continue
        for j in (i + 1, i - 1) if i + 1 < len(cues) else (i - 1,):
            if 0 <= j < len(cues) and sec(cues[j]) == sec(c):
                a_, b_ = sorted((i, j)); txt = cues[a_]['text'] + ' ' + cues[b_]['text']
                if len(txt) <= 72:
                    cues[a_:b_ + 1] = [{'t0': cues[a_]['t0'], 't1': cues[b_]['t1'], 'text': txt}]; changed = True; break
        if changed: break
short = [c for c in cues if c['t1'] - c['t0'] < 1.8]
print('still under 1.8 s:', len(short))
assert all(c['t1'] - c['t0'] >= 1.0 for c in cues), [c for c in cues if c['t1'] - c['t0'] < 1.0]
json.dump({'secs': SECS, 'cues': cues}, open(os.path.join(HERE, 'subs.json'), 'w'), ensure_ascii=False, indent=0)
print(len(cues), 'cues; longest', max(len(c['text']) for c in cues), 'chars')
