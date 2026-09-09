#!/usr/bin/env python3
"""
Gera placeholders cinza com o nome do arquivo em cima, na proporção certa,
pra você abrir a página e ver o layout antes de ter os renders prontos.
Depois basta sobrescrever cada arquivo pelo render real (mesmo nome).

    pip install pillow
    python3 tools/make-placeholders.py
"""
from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BG, FG, LINE = (22, 22, 26), (110, 108, 104), (38, 38, 44)

SPEC = [
    ("assets/img/research/ref-{:02d}.webp",   6, (1400, 1400)),
    ("assets/img/lowpoly/lowpoly-shaded.webp", 1, (2000, 1250)),
    ("assets/img/lowpoly/lowpoly-wire.webp",   1, (2000, 1250)),
    ("assets/img/lowpoly/lowpoly-detail-{:02d}.webp", 3, (1400, 1050)),
    ("assets/img/sculpt/sculpt-clay.webp",     1, (2400, 1350)),
    ("assets/img/sculpt/sculpt-detail-{:02d}.webp",   3, (1400, 1050)),
    ("assets/img/studio/studio-{:02d}.webp",   6, (2000, 1500)),
    ("assets/img/interior/interior-hero.webp", 1, (2800, 1575)),
    ("assets/img/interior/interior-{:02d}.webp", 4, (1600, 1200)),
    ("assets/img/moods/mood-{:02d}.webp",      5, (1400, 1400)),
    ("assets/img/turntable/frame-{:03d}.webp", 36, (1400, 1400)),
    ("assets/video/story-poster.jpg",          1, (2560, 1440)),
]


def draw(path: Path, size):
    img = Image.new("RGB", size, BG)
    d = ImageDraw.Draw(img)
    w, h = size
    d.rectangle([0, 0, w - 1, h - 1], outline=LINE, width=3)
    d.line([0, 0, w, h], fill=LINE, width=2)
    d.line([w, 0, 0, h], fill=LINE, width=2)
    label = f"{path.name}   {w}x{h}"
    d.text((28, 24), label, fill=FG)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, quality=82)


for tpl, n, size in SPEC:
    for i in range(1, n + 1):
        name = tpl.format(i) if "{" in tpl else tpl
        draw(ROOT / name, size)

print("placeholders gerados.")
