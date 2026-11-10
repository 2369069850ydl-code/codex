# usage: png2raw.py <dir> <count> <out.rgb>  (expects 8-bit RGB PNGs with filter type 0 on every row)
import sys,zlib,struct
d,n,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
o=open(out,'wb')
for i in range(n):
    b=open(f'{d}/{i:03d}.png','rb').read(); p=8; idat=b''
    while p<len(b):
        L=struct.unpack('>I',b[p:p+4])[0]; t=b[p+4:p+8]; c=b[p+8:p+8+L]
        if t==b'IHDR': W,H,bd,ct=struct.unpack('>IIBB',c[:10]); assert bd==8 and ct==2
        if t==b'IDAT': idat+=c
        p+=12+L
    r=zlib.decompress(idat); s=W*3+1
    for y in range(H):
        assert r[y*s]==0, 'filtered row'
        o.write(r[y*s+1:(y+1)*s])
print('ok',W,H)
