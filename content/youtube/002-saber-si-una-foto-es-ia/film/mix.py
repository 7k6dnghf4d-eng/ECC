"""mix.py — synthesized score + foley + Kokoro narration → out/mix.wav (same sound family as video 001)."""
import os, sys, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit, whoosh
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EVJ['dur']; EV = EVJ['ev']
L = json.load(open(os.path.join(HERE, 'lines.json')))
SEC = [min(l['t0'] for l in L if l['sec'] == s) - 0.35 for s in range(6)]; SEC[0] = 0; SEC.append(L[-1]['t1'])
FREEZE = next(e['t'] for e in EV if e['type'] == 'freeze')
N = int(DUR * SR); rng = np.random.default_rng(2)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
KEY = [62, 65, 67, 69, 72, 74, 77, 79, 81]
def sine(f, d, tau): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, tau)
def mallet(m, v=1.0, d=1.2, cents=0):
    f = hz(m) * 2 ** (cents / 1200)
    x = sine(f, d, .32) + sine(4 * f, d, .05) * .35 + sine(10 * f, d, .012) * .12 + sine(2 * f, d, .2) * .15
    return norm(x * np.minimum(1, t_(d) / .003)) * v
def glass(m, v=1.0): f = hz(m); d = .7; return norm(sine(f, d, .22) + sine(2.76 * f, d, .07) * .3 + hp(noise(d), 6000) * env_exp(d, .002) * .2) * v
mus = np.zeros((N, 2)); E8 = 60 / 96 / 2
def pad(t0, t1, notes, v):
    d = t1 - t0; tt = t_(d); env = np.minimum(1, tt / 2.5) * np.minimum(1, (d - tt) / 2.5)
    add(mus, lp(sum(np.sin(2 * np.pi * hz(m) * tt * (1 + dt)) for m in notes for dt in (-.0015, .0015)), 1800) * env / (2 * len(notes)) * v, t0)
pad(0, FREEZE, [50, 57, 62], .5); pad(FREEZE + 1.0, SEC[6], [50, 57, 62, 65], .32)
MOTIF = [62, 69, 65, 72, 67, 74, 77, 69]
for s, notes in zip(range(1, 6), [2, 3, 4, 7, 8]):         # the motif fills in as the method comes together
    t = np.ceil(SEC[s] / E8) * E8
    while t < SEC[s + 1] - .3:
        i = int(round(t / E8)) % 8
        if i < notes: add(mus, mallet(MOTIF[i], .2), t, pan=(i - 3.5) * .08)
        t += E8
add(mus, sum(mallet(m, .4, d=3) for m in (62, 65, 69, 74)), FREEZE + 1.0)
for m in (62, 69, 74, 77): add(mus, mallet(m, .35, d=4), SEC[6] + 0.2)
fol = np.zeros((N, 2))
def key(): d = .06; return norm(bp(noise(d), 1500, 5000) * env_exp(d, .004) + sine(200, d, .01) * .4) * .25
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'scatter': add(fol, mallet(int(rng.choice(KEY)) + 12, .07, d=.4, cents=rng.uniform(-45, 45)), t, pan=rng.uniform(-.9, .9))
    elif ty == 'stamp': add(fol, norm(lp(noise(.25), 900) * env_exp(.25, .04)) * .5, t); add(fol, mallet(70, .25, d=.5, cents=-30), t)
    elif ty == 'whoosh': add(fol, whoosh(.4, .28), t - .1)
    elif ty == 'pop': add(fol, glass(int(rng.choice(KEY[3:])) + 12, .16), t)
    elif ty == 'snap': add(fol, glass(KEY[e['i']] + 12, .22), t)
    elif ty == 'tick': add(fol, glass(KEY[e['i'] + 2] + 12, .25), t)
    elif ty == 'confirm': add(fol, glass(81, .25) + glass(88, .15), t)
    elif ty == 'sweep': add(fol, norm(bp(noise(1.6), 3000, 9000) * np.sin(np.linspace(0, np.pi, int(1.6 * SR)))) * .08, t)
    elif ty == 'break': add(fol, norm(lp(noise(1.0), 2500) * env_exp(1.0, .25)) * .3, t)
    elif ty == 'mark': add(fol, sine(380, .1, .03) * .35, t)
    elif ty == 'lock': add(fol, glass(86, .3), t)
    elif ty == 'end': add(fol, whoosh(.5, .2), t - .2)
for b in (mus, fol): b[int(FREEZE * SR):int((FREEZE + 1.0) * SR)] = 0      # digital zero on the freeze (the voice keeps talking)
v, sr = sf.read(os.path.join(HERE, '..', 'narracion.wav')); v = resample_poly(v, SR, sr)[:N]
v = compress(v / max(1e-9, np.abs(v).max()), thr=.3, ratio=3)
vox = np.zeros((N, 2)); add(vox, v, 0.0)
envv = uniform_filter1d(np.abs(vox[:, 0]), int(.25 * SR)); on = np.clip(envv / (envv.max() * .15), 0, 1)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
mus *= rms(vox) / rms(mus) * 10 ** (-10 / 20); fol *= rms(vox) / rms(fol) * 10 ** (-9 / 20)
mus *= (1 - on * (1 - 10 ** (-8 / 20)))[:, None]; fol *= (1 - on * (1 - 10 ** (-4 / 20)))[:, None]
out = np.stack([limit((vox + mus + fol)[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR, subtype='PCM_24')
print('mix.wav', round(len(out) / SR, 2), 's')
