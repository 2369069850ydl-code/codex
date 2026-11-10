# usage: tile.py <raw_rgb24> <w> <h> <out_prefix> <start> <end> <step> <cols> <rows>
# Tiles selected frames of a raw rgb24 stream into PNG sheets; each tile is stamped with its frame number.
import sys, zlib, struct

raw = sys.argv[1]
w, h = int(sys.argv[2]), int(sys.argv[3])
pre = sys.argv[4]
a, b, st, cols, rows = map(int, sys.argv[5:10])

data = open(raw, 'rb').read()
fs = w * h * 3
n = len(data) // fs
FONT = {
    '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110',
    '2': '01110100010000100010001000100011111', '3': '11110000010000101110000010000111110',
    '4': '00010001100101010010111110001000010', '5': '11111100001111000001000011000101110',
    '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000',
    '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100',
}


def put_text(img, W, x0, y0, s, sc=3):
    # black box behind digits
    for y in range(y0, y0 + 7 * sc + 4):
        for x in range(x0, x0 + len(s) * 6 * sc + 4):
            img[(y * W + x) * 3:(y * W + x) * 3 + 3] = b'\x00\x00\x00'
    for ci, chx in enumerate(s):
        for r in range(7):
            for c in range(5):
                if FONT[chx][r * 5 + c] != '1':
                    continue
                for dy in range(sc):
                    for dx in range(sc):
                        x = x0 + 2 + ci * 6 * sc + c * sc + dx
                        y = y0 + 2 + r * sc + dy
                        img[(y * W + x) * 3:(y * W + x) * 3 + 3] = b'\xff\xff\x00'


def chunk(t, d):
    return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))


idx = list(range(a, min(b, n - 1) + 1, st))
per = cols * rows
g = 4
for si in range(0, len(idx), per):
    part = idx[si:si + per]
    W = cols * (w + g) + g
    H = rows * (h + g) + g
    img = bytearray(b'\x22' * (W * H * 3))
    for k, fi in enumerate(part):
        X = g + (k % cols) * (w + g)
        Y = g + (k // cols) * (h + g)
        for y in range(h):
            img[((Y + y) * W + X) * 3:((Y + y) * W + X + w) * 3] = data[fi * fs + y * w * 3:fi * fs + (y + 1) * w * 3]
        put_text(img, W, X, Y, str(fi))
    rowsb = b''.join(b'\x00' + bytes(img[y * W * 3:(y + 1) * W * 3]) for y in range(H))
    png = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(rowsb, 6)) + chunk(b'IEND', b''))
    fn = f'{pre}_{part[0]:03d}-{part[-1]:03d}.png'
    open(fn, 'wb').write(png)
    print(fn)
