"""events.json (the cues the page shows) → subtitles_es.srt"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cues = [{'t0': e['t'], 't1': e['t1'], 'text': e['text']} for e in json.load(open(os.path.join(HERE, 'events.json')))['ev'] if e['type'] == 'sub']
assert cues and all(c['t1'] - c['t0'] >= 1.0 for c in cues)
json.dump(cues, open(os.path.join(HERE, 'out', 'cues.json'), 'w'), ensure_ascii=False)
subprocess.run([sys.executable, os.path.join(os.environ['LIB'], 'core/render/srt.py'), os.path.join(HERE, 'out', 'cues.json'), os.path.join(HERE, 'subtitles_es.srt')], check=True)
