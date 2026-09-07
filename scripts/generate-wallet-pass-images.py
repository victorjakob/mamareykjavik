#!/usr/bin/env python3
"""Generate the Mama Tribe Card wallet images from the master logo.

Design "Cream & botanical" (Sept 2026). Run from the repo root:
    python3 scripts/generate-wallet-pass-images.py
Needs Pillow, numpy, scipy. Writes into public/wallet-pass/:
    strip.png / @2x / @3x   375x123pt cream band, wreath at right (Apple strip, Google hero)
    logo.png  / @2x / @3x   the "Mama" script, max 160x50pt, transparent (Apple logo)
    icon.png  / @2x / @3x   wreath on cream, 29pt square (Apple icon)
    google-logo.png         wreath on cream, 512px square (Google programLogo)
"""
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "mamaimg", "mamalogo.png")
OUT = os.path.join(ROOT, "public", "wallet-pass")
CREAM = (249, 244, 236)
INK = (44, 24, 16)

src = Image.open(SRC).convert("RGBA")
logo = src.crop(src.getbbox()); W, H = logo.size

def strip(scale):
    w, h = 375 * scale, 123 * scale
    im = Image.new("RGBA", (w, h)); px = im.load()
    stops = [(0, (243, 230, 211)), (0.55, CREAM), (1, (241, 232, 220))]
    for x in range(w):
        t = x / (w - 1)
        for i in range(len(stops) - 1):
            a, ca = stops[i]; b, cb = stops[i + 1]
            if a <= t <= b:
                u = (t - a) / (b - a); c = tuple(int(ca[k] + (cb[k] - ca[k]) * u) for k in range(3)); break
        for y in range(h): px[x, y] = c + (255,)
    # faint blurred leaves bottom-left for a little texture
    big = logo.crop((0, int(H * 0.55), W, H)); bh = int(h * 1.3)
    big = big.resize((int(big.width * bh / big.height), bh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5 * scale))
    big.putalpha(big.split()[3].point(lambda v: int(v * 0.07)))
    im.alpha_composite(big, (int(-big.width * 0.15), int(-bh * 0.15)))
    # the full wreath, right
    wh = int(h * 0.98); wr = logo.resize((int(W * wh / H), wh), Image.LANCZOS)
    im.alpha_composite(wr, (w - wr.width - int(10 * scale), int((h - wh) / 2)))
    return im.convert("RGB")

def script_logo():
    a = np.array(logo).astype(int); r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    ink = (al > 150) & (r < 80) & (g < 80) & (b < 80) & ((np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)) < 28)
    y0, y1 = int(H * 0.25), int(H * 0.537)            # the "Mama" script rows
    x_lo, x_hi = int(W * 0.2), int(W * 0.8)
    cols = np.where(ink[y0:y1, x_lo:x_hi].sum(0) > 0)[0]; x0, x1 = x_lo + cols.min(), x_lo + cols.max()
    out = np.zeros((H, W, 4), dtype=np.uint8); out[:, :, :3] = INK
    mask = np.zeros((H, W), bool); mask[y0:y1, x0:x1 + 1] = True
    out[:, :, 3] = np.where(ink & mask, al, 0).astype(np.uint8)
    lab, n = ndimage.label(out[:, :, 3] > 40); sizes = ndimage.sum(out[:, :, 3] > 40, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 150])   # drop leaf specks
    out[:, :, 3] = np.where(keep, out[:, :, 3], 0)
    im = Image.fromarray(out); return im.crop(Image.fromarray(out[:, :, 3]).getbbox())

def square(sz):
    sq = Image.new("RGBA", (sz, sz), CREAM + (255,)); ih = int(sz * 0.86)
    w2 = logo.resize((int(W * ih / H), ih), Image.LANCZOS)
    if w2.width > sz * 0.9: w2 = w2.resize((int(sz * 0.9), int(w2.height * sz * 0.9 / w2.width)), Image.LANCZOS)
    sq.alpha_composite(w2, ((sz - w2.width) // 2, (sz - w2.height) // 2)); return sq.convert("RGB")

os.makedirs(OUT, exist_ok=True)
for s, suffix in [(1, ""), (2, "@2x"), (3, "@3x")]:
    strip(s).save(os.path.join(OUT, f"strip{suffix}.png"), optimize=True)
    sc = script_logo(); Hn = 50 * s
    im = sc.resize((int(sc.width * Hn / sc.height), Hn), Image.LANCZOS)
    if im.width > 160 * s: im = im.resize((160 * s, int(im.height * 160 * s / im.width)), Image.LANCZOS)
    c = Image.new("RGBA", (im.width, 50 * s)); c.alpha_composite(im, (0, (50 * s - im.height) // 2)); c.save(os.path.join(OUT, f"logo{suffix}.png"))
    square(29 * s).save(os.path.join(OUT, f"icon{suffix}.png"))
square(512).save(os.path.join(OUT, "google-logo.png"))
print("wallet-pass images written to", OUT)
