#!/usr/bin/env python3
"""Create the small responsive WebP variants (_240w, _360w) for every design photo.

Cards on phones are ~180 CSS px wide and gallery thumbnails 96 px, so the 480w file was
2-4x more pixels than needed. Run after adding a design photo:

    python tools/make-image-variants.py          # only missing variants
    python tools/make-image-variants.py --force  # rebuild all
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (240, 360)
QUALITY = 72
force = '--force' in sys.argv

made = 0
for src in sorted((ROOT / 'explore' / 'designs').glob('*/*.webp')):
    stem = src.stem
    # Only the full-size master (e.g. ..._front.webp), not existing variants or cards.
    if stem.endswith(('_card', '_240w', '_360w', '_480w', '_720w', '_960w')):
        continue
    with Image.open(src) as im:
        im = im.convert('RGB')
        for w in WIDTHS:
            out = src.with_name(f'{stem}_{w}w.webp')
            if out.exists() and not force:
                continue
            h = round(im.height * w / im.width)
            im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=QUALITY, method=6)
            made += 1
            print(f'{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KiB')
print(f'{made} variant(s) written')
