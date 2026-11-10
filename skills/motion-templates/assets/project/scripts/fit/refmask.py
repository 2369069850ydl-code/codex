# usage: refmask.py <raw_rgb24 at 284x160> <out.bin>
# Writes one byte per pixel per frame: 1 where the pixel is the card-side/border purple.
import sys
raw, out = sys.argv[1], sys.argv[2]
d = open(raw, 'rb').read()
W, H = 284, 160
fs = W * H * 3
n = len(d) // fs

def is_purple(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    if mx < 76 or mx > 205 or mx == 0:
        return False
    s = (mx - mn) / mx
    if s < 0.3 or s > 0.85 or mx != b:
        return False
    # hue in degrees, blue-dominant branch
    h = 60 * ((r - g) / (mx - mn)) + 240
    return 235 <= h <= 258

o = bytearray(n * W * H)
for f in range(n):
    base = f * fs
    for i in range(W * H):
        p = base + i * 3
        if is_purple(d[p], d[p + 1], d[p + 2]):
            o[f * W * H + i] = 1
open(out, 'wb').write(o)
print('frames', n, 'mean purple px/frame', sum(o) // n)
