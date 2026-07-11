#!/usr/bin/env python3
"""Generate particle stencils for THE FIELD (EXPERIENCE-SPEC §3).
Draws procedural archetype silhouettes (crown, coin, heart, flame) and the
card-back plate, rejection-samples N points inside each, normalizes to a
[-1,1] square (aspect preserved), writes src/data/stencils.json and a
verification montage at /tmp/stencils_montage.png.
Archetypes only — hieroglyphic, never consumer objects (Jad, locked)."""
import json, math, random
from PIL import Image, ImageDraw

S = 900  # raster size
random.seed(41)

def canvas():
    im = Image.new("L", (S, S), 0)
    return im, ImageDraw.Draw(im)

def crown():
    im, d = canvas()
    # band
    d.rectangle([180, 560, 720, 660], fill=255)
    # three peaks (zigzag) + side peaks
    pts = [(180,560),(180,380),(300,500),(450,300),(600,500),(720,380),(720,560)]
    d.polygon(pts, fill=255)
    # orbs on peaks
    for x,y in [(180,360),(450,280),(720,360)]:
        d.ellipse([x-34,y-34,x+34,y+34], fill=255)
    # band jewels (negative space)
    for x in (300,450,600):
        d.ellipse([x-26,584,x+26,636], fill=0)
    return im

def coin():
    im, d = canvas()
    d.ellipse([170,170,730,730], fill=255)
    d.ellipse([225,225,675,675], fill=0)     # rim ring
    d.ellipse([255,255,645,645], fill=255)   # face
    # square hole (old-world coin, reads currency w/o any nation's sign)
    d.rectangle([395,395,505,505], fill=0)
    # radial notches on rim
    for k in range(24):
        a = k*math.pi/12
        x1,y1 = 450+math.cos(a)*272, 450+math.sin(a)*272
        x2,y2 = 450+math.cos(a)*298, 450+math.sin(a)*298
        d.line([x1,y1,x2,y2], fill=0, width=10)
    return im

def heart():
    im, d = canvas()
    poly=[]
    for i in range(400):
        t = i/400*2*math.pi
        x = 16*math.sin(t)**3
        y = 13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t)
        poly.append((450+x*24, 430-y*24))
    d.polygon(poly, fill=255)
    return im

def flame():
    im, d = canvas()
    # outer flame: two mirrored curves with a leaning tip
    left  = [(450,140),(350,300),(300,470),(330,640),(450,740)]
    right = [(450,740),(590,630),(620,440),(540,300),(485,220),(450,140)]
    d.polygon(left+right[:-1], fill=255)
    # inner flame (negative), offset upward-left
    inner_l=[(452,340),(400,450),(390,560),(452,650)]
    inner_r=[(452,650),(520,560),(512,450),(470,380),(452,340)]
    d.polygon(inner_l+inner_r[:-1], fill=0)
    return im

def cardback():
    im, d = canvas()
    # plate proportions ~4:5 within square
    x0,y0,x1,y1 = 230,120,670,780
    d.rounded_rectangle([x0,y0,x1,y1], radius=42, fill=255)
    d.rounded_rectangle([x0+26,y0+26,x1-26,y1-26], radius=28, fill=0)
    d.rounded_rectangle([x0+42,y0+42,x1-42,y1-42], radius=20, fill=255)
    d.rounded_rectangle([x0+56,y0+56,x1-56,y1-56], radius=16, fill=0)
    cx,cy=(x0+x1)/2,(y0+y1)/2
    # central rosette: 8-petal star polygon
    for k in range(8):
        a=k*math.pi/4
        tip=(cx+math.cos(a)*150, cy+math.sin(a)*150)
        b1=(cx+math.cos(a+0.42)*54, cy+math.sin(a+0.42)*54)
        b2=(cx+math.cos(a-0.42)*54, cy+math.sin(a-0.42)*54)
        d.polygon([b1,tip,b2,(cx,cy)], fill=255)
    d.ellipse([cx-40,cy-40,cx+40,cy+40], fill=255)
    d.ellipse([cx-22,cy-22,cx+22,cy+22], fill=0)
    # corner marks
    for qx in (x0+92,x1-92):
        for qy in (y0+108,y1-108):
            d.ellipse([qx-16,qy-16,qx+16,qy+16], fill=255)
    return im

def sample(im, n):
    px = im.load()
    pts=[]
    while len(pts)<n:
        x,y = random.random()*S, random.random()*S
        if px[int(x),int(y)]>128:
            pts.append((x,y))
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
    half=max(max(xs)-min(xs),max(ys)-min(ys))/2
    return [[round((x-cx)/half,3),round((y-cy)/half,3)] for x,y in pts]

SHAPES = {"crown":(crown,1500),"coin":(coin,1500),"heart":(heart,1500),
          "flame":(flame,1500),"card":(cardback,2400)}
out={}
montage = Image.new("RGB",(S*5//2, S//2),(7,11,26))
md = ImageDraw.Draw(montage)
for i,(name,(fn,n)) in enumerate(SHAPES.items()):
    im = fn()
    out[name]=sample(im,n)
    for x,y in out[name]:
        mx = i*(S//2)+ (x*0.44+0.5)*(S//2)
        my = (y*0.44+0.5)*(S//2)
        md.ellipse([mx-1.4,my-1.4,mx+1.4,my+1.4], fill=(201,169,106))
montage.save("/tmp/stencils_montage.png")
json.dump(out, open("src/data/stencils.json","w"), separators=(",",":"))
print("stencils.json:", {k:len(v) for k,v in out.items()},
      "| size:", len(open("src/data/stencils.json").read())//1024, "KB")
