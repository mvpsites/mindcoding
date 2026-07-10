"""Art courier: runs on GitHub Actions (full internet), downloads card art
from the manifest, converts to optimized webp in public/art/."""
import json, io, os
import requests
from PIL import Image

manifest = json.load(open("tools/art-manifest.json"))
os.makedirs("public/art", exist_ok=True)
for card_id, url in manifest.items():
    out = f"public/art/{card_id}.webp"
    if os.path.exists(out):
        print(f"skip {card_id} (exists — delete the webp to force refetch)")
        continue
    print(f"fetching {card_id} ...")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    img = Image.open(io.BytesIO(r.content)).convert("RGB")
    # scene-* assets are full-bleed backdrops and need width; cards stay 720
    w = 1600 if card_id.startswith("scene-") else 720
    q = 84 if card_id.startswith("scene-") else 88
    if img.size[0] > w:
        img = img.resize((w, int(w * img.size[1] / img.size[0])), Image.LANCZOS)
    img.save(out, "WEBP", quality=q)
    print(f"  saved {out} ({os.path.getsize(out)//1024} KB)")
print("courier done")
