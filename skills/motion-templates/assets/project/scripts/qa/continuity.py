# usage: continuity.py <raw_rgb24> <w> <h>
# Prints per-frame motion energy and flags (a) jumps: diff much larger than neighbours,
# (b) one-frame glitches: frame i differs from both i-1 and i+1 while i-1 ~ i+1.
import sys
raw,w,h=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
d=open(raw,'rb').read(); fs=w*h*3; n=len(d)//fs
STEP=7  # sample every 7th byte
def diff(a,b):
    A=d[a*fs:(a+1)*fs:STEP]; B=d[b*fs:(b+1)*fs:STEP]
    return sum(abs(x-y) for x,y in zip(A,B))/len(A)
m=[0.0]+[diff(i-1,i) for i in range(1,n)]
jumps=[]; glitches=[]
for i in range(1,n):
    win=[m[j] for j in range(max(1,i-4),min(n,i+5)) if j!=i]
    med=sorted(win)[len(win)//2] if win else 0
    if m[i]>2.0 and m[i]>3.5*max(med,0.3): jumps.append((i,round(m[i],2),round(med,2)))
for i in range(1,n-1):
    skip=diff(i-1,i+1)
    if m[i]>1.0 and m[i+1]>1.0 and skip<0.35*min(m[i],m[i+1]): glitches.append((i,round(m[i],2),round(skip,2)))
print('frames',n)
print('motion energy per 10 frames:',' '.join(f'{sum(m[k:k+10])/10:.1f}' for k in range(0,n,10)))
print('static frames (diff<0.05):',sum(1 for x in m[1:] if x<0.05))
print('jumps (frame, diff, local median):',jumps)
print('one-frame glitches (frame, diff, skip-diff):',glitches)
