"""mix.py — synthesized 120 BPM news theme (minor), package hits, foley, Kokoro narration → out/mix.wav"""
import os, sys, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.environ['LIB'])
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit, whoosh
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
J = json.load(open(os.path.join(HERE, 'events.json'))); DUR = J['dur']; EV = J['ev']
OFF = next(e['off'] for e in EV if e['type'] == 'voice'); END0 = next(e['t'] for e in EV if e['type'] == 'tutti')
N = int(DUR * SR); hz = lambda m: 440 * 2 ** ((m - 69) / 12); BEAT = .5
def sine(f, d, tau): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, tau)
def pluck(m, d=.35, v=1.): f = hz(m); return norm(sine(f, d, .09) + sine(2 * f, d, .05) * .5 + sine(3 * f, d, .03) * .25) * v   # 2nd/3rd harmonics so the bass speaks on phones
def saw(m, d, v=1.): f = hz(m); x = 2 * ((f * t_(d)) % 1) - 1; return lp(x, 2200) * np.minimum(1, t_(d) / .01) * env_exp(d, d * .6) * v
def kick(): d = .3; tt = t_(d); return norm(np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * env_exp(d, .09))
def snare(): d = .2; return norm(bp(noise(d), 1500, 7000) * env_exp(d, .05) + sine(190, d, .04) * .5)
def glock(m, v=1.): f = hz(m); d = 1.0; return norm(sine(f, d, .35) + sine(2.76 * f, d, .1) * .3) * v
def timp(): d = 1.2; return norm(sine(hz(38), d, .4) + lp(noise(d), 300) * env_exp(d, .05) * .6)
mus = np.zeros((N, 2))
CH = [[45, 52, 57], [41, 48, 53], [43, 50, 55], [40, 47, 52]]   # Am F G Em
t0, t1 = 1.5, END0
b = 0
while t0 + b * BEAT < t1:
    t = t0 + b * BEAT; ch = CH[(b // 8) % 4]
    add(mus, pluck(ch[0] - 12 + 24, .4, .55), t)                              # pizzicato-ish bass on the beat
    for k in range(2): add(mus, saw(ch[(b * 2 + k) % 3] + 12, .22, .16), t + k * BEAT / 2, pan=(-.3, .3)[k])  # eighth-note string pulse
    if b % 2 == 0: add(mus, kick() * .5, t)
    else: add(mus, snare() * .22, t)
    b += 1
for m in (57, 64, 69, 72): add(mus, glock(m, .3), END0)
for m in (45, 52, 57, 64): add(mus, saw(m, 2.5, .25), END0)
fol = np.zeros((N, 2)); rng = np.random.default_rng(3)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'sting': add(mus, sum(saw(m, 1.2, .3) for m in (45, 52, 57, 64)), t); add(fol, timp() * .7, t)
    elif ty == 'glock': add(fol, glock(76, .35), t)
    elif ty == 'whoosh': add(fol, whoosh(.35, .3), t)
    elif ty == 'timpani': add(fol, timp() * .5, t)
    elif ty == 'flaps':
        for i in range(12): add(fol, norm(bp(noise(.02), 2000, 6000) * env_exp(.02, .003)) * .25, t + i * .035, pan=rng.uniform(-.3, .3))
    elif ty == 'stamp': add(fol, norm(lp(noise(.25), 900) * env_exp(.25, .04)) * .6, t); add(fol, norm(bp(noise(.05), 2000, 5000) * env_exp(.05, .006)) * .3, t + .03)
    elif ty == 'paper': add(fol, norm(bp(noise(.18), 1500, 8000) * env_exp(.18, .05)) * .2, t)
    elif ty == 'alert': add(fol, glock(70, .3), t); add(fol, glock(71, .25), t + .12)
    elif ty == 'tick': add(fol, glock(72 + [0, 3, 5, 7][e['i']], .3), t); add(fol, sine(2100, .03, .004) * .2, t)
    elif ty == 'tutti': add(fol, timp() * .7, t)
v, sr = sf.read(os.path.join(HERE, '..', 'narracion.wav')); v = resample_poly(v, SR, sr)
v = hp(v, 90); v = compress(v / max(1e-9, np.abs(v).max()), thr=.3, ratio=3)
vox = np.zeros((N, 2)); add(vox, v, OFF)
envv = uniform_filter1d(np.abs(vox[:, 0]), int(.25 * SR)); on = np.clip(envv / (envv.max() * .15), 0, 1)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
mus *= rms(vox) / rms(mus) * 10 ** (-9 / 20); fol *= rms(vox) / rms(fol) * 10 ** (-8 / 20)
mus *= (1 - on * (1 - 10 ** (-7 / 20)))[:, None]; fol *= (1 - on * (1 - 10 ** (-3 / 20)))[:, None]
out = np.stack([limit((vox + mus + fol)[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR, subtype='PCM_24'); print('mix.wav', round(len(out) / SR, 2))
