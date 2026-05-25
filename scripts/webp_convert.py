"""Generate .webp alongside every raster image under img/. Originals are kept."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent / "img"
MAX_W = 2400
QUALITY = 82
EXTS = {".jpg", ".jpeg", ".png"}

def convert(p: Path) -> tuple[int, int]:
    out = p.with_suffix(".webp")
    img = Image.open(p)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("P", "RGBA"):
        # keep alpha for PNG; flatten palette
        if "A" not in img.mode:
            img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > MAX_W:
        h = round(img.height * MAX_W / img.width)
        img = img.resize((MAX_W, h), Image.LANCZOS)
    img.save(out, "WEBP", quality=QUALITY, method=6)
    return p.stat().st_size, out.stat().st_size

total_in = total_out = 0
for p in ROOT.rglob("*"):
    if p.suffix.lower() in EXTS and p.is_file():
        try:
            a, b = convert(p)
            total_in += a; total_out += b
            print(f"  {p.relative_to(ROOT)}  {a/1024:>7.0f}K -> {b/1024:>6.0f}K")
        except Exception as e:
            print(f"  FAIL {p.relative_to(ROOT)}: {e}")

print(f"\nTotal: {total_in/1024/1024:.1f} MB -> {total_out/1024/1024:.1f} MB "
      f"({100*(1-total_out/total_in):.0f}% smaller)")
