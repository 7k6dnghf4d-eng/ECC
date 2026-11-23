"""mix.py — score + foley + the user's narration → out/mix.wav
Score: synthesized mallets in D minor pentatonic, an additive process (one more note per trick).
Disorder sounds are scattered (detuned, random pans); the answer's sounds are one in-key family, centred."""
import os, sys, json, subprocess, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit, whoosh

S = [0, 31.2, 60.0, 89.8, 113.8, 141.0, 160.8, 184.7, 217.5, 242.8]
FREEZE = (186.0, 186.8)
EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; EV = EV['ev']
N = int(DUR * SR); rng = np.random.default_rng(1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
KEY = [62, 65, 67, 69, 72, 74, 77, 79, 81]          # D minor pentatonic

def sine(f, d, tau): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, tau)
def mallet(m, v=1.0, d=1.2, cents=0):
    f = hz(m) * 2 ** (cents / 1200)
    x = sine(f, d, .32) + sine(4 * f, d, .05) * .35 + sine(10 * f, d, .012) * .12 + sine(2 * f, d, .2) * .15  # marimba-like partials (2nd and 3rd keep it audible on phones)
    a = np.minimum(1, t_(d) / .003); return norm(x * a) * v
def glass(m, v=1.0): f = hz(m); d = .7; return norm(sine(f, d, .22) + sine(2.76 * f, d, .07) * .3 + hp(noise(d), 6000) * env_exp(d, .002) * .2) * v

# ─── music ───
mus = np.zeros((N, 2))
BEAT = 60 / 96; E8 = BEAT / 2
def pad(t0, t1, notes, v):
    d = t1 - t0; tt = t_(d); env = np.minimum(1, tt / 2.5) * np.minimum(1, (d - tt) / 2.5)
    x = sum(np.sin(2 * np.pi * hz(m) * tt * (1 + det)) for m in notes for det in (-.0015, .0015))
    add(mus, lp(x, 1800) * env / (2 * len(notes)) * v, t0)
pad(0, 20.0, [50, 57, 62], .5)                         # under the problem: a low drone
pad(26.6, S[8], [50, 57, 62, 65], .32)                 # under the tricks
MOTIF = [62, 69, 65, 72, 67, 74, 77, 69]
for k in range(1, 8):                                  # additive build: trick k plays k notes of the motif
    t = np.ceil(S[k] / E8) * E8
    while t < S[k + 1] - .3:
        i = int(round(t / E8)) % 8
        if i < k and not (FREEZE[0] <= t < FREEZE[1] + .1): add(mus, mallet(MOTIF[i], .22), t, pan=(i - 3.5) * .08)
        t += E8
t = np.ceil((S[8] + 3) / E8) * E8                      # recap: the whole motif, then the final chord
while t < 240.0: add(mus, mallet(MOTIF[int(round(t / E8)) % 8], .2), t); t += E8
for m in (62, 69, 74, 77): add(mus, mallet(m, .35, d=4), 240.2)
add(mus, sum(mallet(m, .4, d=3) for m in (62, 65, 69, 74)), 26.6)        # first sound after the thesis
add(mus, sum(mallet(m, .45, d=3) for m in (62, 65, 69, 74)), FREEZE[1])  # first sound after the freeze

# ─── foley ───
fol = np.zeros((N, 2))
def key(): d = .06; return norm(bp(noise(d), 1500, 5000) * env_exp(d, .004) + sine(200, d, .01) * .4) * .25
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'key': add(fol, key(), t, pan=rng.uniform(-.1, .1))
    elif ty == 'send': add(fol, whoosh(.25, .3), t)
    elif ty == 'scatter': add(fol, mallet(int(rng.choice(KEY)) + 12, .07, d=.4, cents=rng.uniform(-45, 45)), t, pan=rng.uniform(-.9, .9))
    elif ty == 'alert': add(fol, mallet(71, .3, d=.5, cents=-30) + mallet(70, .25, d=.5, cents=20), t, pan=.4)
    elif ty == 'break': add(fol, norm(lp(noise(1.2), 2500) * env_exp(1.2, .25)) * .35, t)
    elif ty == 'lock': add(fol, glass(86, .3), t)
    elif ty == 'whoosh': add(fol, whoosh(.4, .28), t - .1)
    elif ty == 'pop': add(fol, glass(int(rng.choice(KEY[3:])) + 12, .16), t)
    elif ty == 'tick': add(fol, sine(2100, .03, .004) * .2, t)
    elif ty == 'sweep': add(fol, norm(bp(noise(1.3), 3000, 9000) * np.sin(np.linspace(0, np.pi, int(1.3 * SR)))) * .08, t)
    elif ty == 'confirm': add(fol, glass(81, .25) + glass(88, .15), t)
    elif ty == 'mark': add(fol, sine(380, .08, .02) * .3, t)
    elif ty == 'snap': add(fol, glass(KEY[e['i']] + 12, .22), t)
    elif ty == 'end': add(fol, whoosh(.5, .2), t - .2)
for buf in (mus, fol): buf[int(FREEZE[0] * SR):int(FREEZE[1] * SR)] = 0   # digital zero (the voice keeps talking)

# ─── voice (the user's narration, starts at 0) ───
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, '..', 'narracion.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.float32).astype(np.float64)[:N]
v = compress(v / max(1e-9, np.abs(v).max()), thr=.3, ratio=3)
vox = np.zeros((N, 2)); add(vox, v, 0.0)

# duck music ~8 dB and foley ~4 dB under the voice
from scipy.ndimage import uniform_filter1d
envv = uniform_filter1d(np.abs(vox[:, 0]), int(.25 * SR)); on = np.clip(envv / (envv.max() * .15), 0, 1)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2)) if np.any(np.abs(x) > 1e-6) else 1
mus *= (rms(vox) / rms(mus)) * 10 ** (-10 / 20); fol *= (rms(vox) / rms(fol)) * 10 ** (-9 / 20)
mus *= (1 - on * (1 - 10 ** (-8 / 20)))[:, None]; fol *= (1 - on * (1 - 10 ** (-4 / 20)))[:, None]
out = vox + mus + fol
out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR, subtype='PCM_24')
print('mix.wav', round(len(out) / SR, 2), 's')
