# usage: cross.py ours_mask.bin ref_mask.bin out.json -- per frame similarity mapping OURS frame t onto REF frame t
import sys, json
W, H = 284, 160; CX, CY = W/2, H/2
A = open(sys.argv[1],'rb').read(); B = open(sys.argv[2],'rb').read(); n = min(len(A), len(B))//(W*H)
def dil(m):
    t = bytearray(W*H)
    for i in range(W*H):
        if m[i]:
            x, y = i % W, i//W
            for dy in (-1,0,1):
                for dx in (-1,0,1):
                    xx, yy = x+dx, y+dy
                    if 0 <= xx < W and 0 <= yy < H: t[yy*W+xx] = 1
    return t
def pts(m):
    p = [(i % W - CX, i//W - CY) for i in range(W*H) if m[i]]
    step = max(1, len(p)//700); return p[::step]
res = {}; cur = (1.0, 0.0, 0.0)
for f in range(n-1, 23, -1):
    Pa = pts(A[f*W*H:(f+1)*W*H]); Pb = pts(B[f*W*H:(f+1)*W*H])
    ta = dil(A[f*W*H:(f+1)*W*H]); tb = dil(B[f*W*H:(f+1)*W*H])
    if len(Pa) < 30 or len(Pb) < 30: continue
    def score(s, tx, ty):
        # symmetric: ours->ref hits + ref->ours hits (inverse map)
        h1 = sum(1 for x, y in Pa if 0 <= (xx := int(s*x+CX+tx+.5)) < W and 0 <= (yy := int(s*y+CY+ty+.5)) < H and tb[yy*W+xx]) / len(Pa)
        h2 = sum(1 for x, y in Pb if 0 <= (xx := int((x-tx)/s+CX+.5)) < W and 0 <= (yy := int((y-ty)/s+CY+.5)) < H and ta[yy*W+xx]) / len(Pb)
        return (h1 + h2)/2
    best = (score(*cur),) + cur
    for ds, dt in ((0.04, 4.0), (0.02, 2.0), (0.01, 1.0), (0.005, 0.5)):
        imp = True
        while imp:
            imp = False; b = best
            for a in (-1,0,1):
                for bx in (-1,0,1):
                    for by in (-1,0,1):
                        c = (best[1]+a*ds, best[2]+bx*dt, best[3]+by*dt)
                        if not 0.7 <= c[0] <= 1.4: continue
                        sc = score(*c)
                        if sc > b[0] + 1e-9: b = (sc,) + c
            if b is not best: best = b; imp = True
    cur = best[1:]
    res[f] = [round(best[1],3), round(best[2]*3,1), round(best[3]*3,1), round(best[0],2)]  # tx,ty in 852-px units
json.dump(res, open(sys.argv[3],'w'))
print('frame  s(ours->ref)  dx  dy (852px)  match')
for f in range(n-1, 23, -6):
    if f in res: print(f, res[f])
