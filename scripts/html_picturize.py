"""Wrap <img> tags in <picture> with WebP source, fix renamed folder paths, add loading=lazy."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ["index.html", "cupids-garden.html", "sirens-shore.html", "pandoras-box.html", "celestial-court.html"]

RENAMES = {
    "Siren_s%20Shore/": "sirens-shore/",
    "Cupid_s%20Garden/": "cupids-garden/",
    "Diwata_s%20Garden/": "diwatas-garden/",
}

IMG_RE = re.compile(r'(?P<indent>[ \t]*)<img\s+(?P<attrs>[^>]*?)/?>', re.IGNORECASE)
SRC_RE = re.compile(r'src\s*=\s*"([^"]+)"', re.IGNORECASE)
EXT_RE = re.compile(r'\.(jpg|jpeg|png|JPG|JPEG|PNG)$')

def to_webp(src: str) -> str:
    return EXT_RE.sub(".webp", src)

def transform(html: str) -> str:
    for old, new in RENAMES.items():
        html = html.replace(old, new)

    def repl(m):
        indent = m.group("indent")
        attrs = m.group("attrs")
        src_m = SRC_RE.search(attrs)
        if not src_m:
            return m.group(0)
        src = src_m.group(1)
        if not EXT_RE.search(src):
            # already webp/svg — just add loading=lazy if missing
            if "loading=" not in attrs:
                attrs = attrs.rstrip() + ' loading="lazy"'
                return f'{indent}<img {attrs}>'
            return m.group(0)
        webp = to_webp(src)
        if "loading=" not in attrs:
            attrs = attrs.rstrip() + ' loading="lazy"'
        return (f'{indent}<picture>\n'
                f'{indent}    <source srcset="{webp}" type="image/webp">\n'
                f'{indent}    <img {attrs}>\n'
                f'{indent}</picture>')

    return IMG_RE.sub(repl, html)

for name in FILES:
    p = ROOT / name
    if not p.exists():
        print(f"skip {name}")
        continue
    orig = p.read_text(encoding="utf-8")
    new = transform(orig)
    if new != orig:
        p.write_text(new, encoding="utf-8")
        print(f"updated {name}")
    else:
        print(f"no change {name}")
