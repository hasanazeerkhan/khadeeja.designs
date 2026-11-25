#!/usr/bin/env python3
"""Generate 1200x630 JPG share images (WhatsApp/Facebook previews are unreliable with WebP).

Run after adding a design or a blog post:  python3 tools/make-og-images.py
Writes og.jpg next to each design page and blog post, plus images/og/default.jpg.
"""
import json
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630


def make(src: Path, dest: Path):
    img = Image.open(src).convert('RGB')
    bg = img.copy()
    scale = max(W / bg.width, H / bg.height)
    bg = bg.resize((round(bg.width * scale), round(bg.height * scale)), Image.LANCZOS)
    left, top = (bg.width - W) // 2, (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H)).filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(bg, Image.new('RGB', (W, H), (10, 10, 10)), 0.45)
    fg = img.copy()
    fg.thumbnail((W, H), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    bg.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'wrote {dest.relative_to(ROOT)}')


ids = json.loads((ROOT / 'explore/designs/index.json').read_text())
for pid in ids:
    d = ROOT / 'explore/designs' / pid
    product = json.loads((d / 'product.json').read_text())
    first = product['images'][0]
    src = d / first if (d / first).exists() else d / Path(first).with_suffix('.webp').name
    make(src, d / 'og.jpg')
    if pid == 'bridal-royal-zardosi':
        make(src, ROOT / 'images/og/default.jpg')

for page in sorted((ROOT / 'blog').glob('*/index.html')):
    pngs = sorted(p for p in page.parent.glob('*.png'))
    if pngs:
        make(pngs[0], page.parent / 'og.jpg')
