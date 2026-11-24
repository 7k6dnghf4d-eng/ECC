"""guion.md → one Kokoro line per paragraph → ../narracion.wav + lines.json (exact start/end of every line, section index).
Run with the library venv: LIB=... $LIB/.venv/bin/python tools/voice.py"""
import json, os, re, subprocess, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); LIB = os.environ['LIB']
VOICE, SPEED = os.environ.get('VOICE', 'em_alex'), float(os.environ.get('SPEED', '1.0'))
md = open(os.path.join(HERE, '..', 'guion.md'), encoding='utf-8').read()
body = md.split('## Guion', 1)[1].split('## Descripción', 1)[0]
lines = []
for si, sec in enumerate(re.split(r'^### .*$', body, flags=re.M)[1:]):
    for para in sec.split('\n\n'):
        p = ' '.join(para.split())
        if p and not p.startswith(('**[VISUAL', '>', '---')): lines.append({'id': f'l{len(lines):02d}', 'sec': si, 'text': p})
os.makedirs(os.path.join(HERE, 'out', 'voice'), exist_ok=True)
tts_in = [{'id': L['id'], 'text': L['text'].replace('PS5', 'PlayStation 5').replace('Xbox', 'Xbox').replace('Playnius', 'Pleinius').replace('GTA 6', 'G T A seis'), 'voice': VOICE, 'lang': 'es', 'speed': SPEED} for L in lines]
json.dump(tts_in, open(os.path.join(HERE, 'out', 'tts_in.json'), 'w'), ensure_ascii=False)
subprocess.run([os.path.join(LIB, '.venv/bin/python'), os.path.join(LIB, 'core/tts/tts.py'), os.path.join(HERE, 'out', 'tts_in.json'), os.path.join(HERE, 'out', 'voice')], check=True)
SR, t, out, prev = 24000, 0.4, [np.zeros(int(0.4 * 24000))], 0
for L in lines:
    gap = 0.75 if L['sec'] != prev else 0.38; prev = L['sec']
    if L is not lines[0]: out.append(np.zeros(int(gap * SR))); t += gap
    x, sr = sf.read(os.path.join(HERE, 'out', 'voice', L['id'] + '.wav')); assert sr == SR, sr
    L['t0'], L['t1'] = round(t, 3), round(t + len(x) / SR, 3); out.append(x); t += len(x) / SR
out.append(np.zeros(int(1.0 * SR)))
sf.write(os.path.join(HERE, '..', 'narracion.wav'), np.concatenate(out), SR)
json.dump(lines, open(os.path.join(HERE, 'lines.json'), 'w'), ensure_ascii=False, indent=0)
print(len(lines), 'lines,', round(t, 1), 's of speech')
