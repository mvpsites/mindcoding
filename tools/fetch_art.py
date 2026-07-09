"""Art courier: runs on GitHub Actions (full internet), downloads card art
from the manifest, converts to optimized webp in public/art/."""
import json, io, os
import requests
from PIL import Image

manifest = json.load(open("tools/art-manifest.json"))
os.makedirs("public/art", exist_ok=True)
for card_id, url in manifest.items():
    out = f"public/art/{card_id}.webp"
    print(f"fetching {card_id} ...")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    img = Image.open(io.BytesIO(r.content)).convert("RGB")
    w = 720
    img = img.resize((w, int(w * img.size[1] / img.size[0])), Image.LANCZOS)
    img.save(out, "WEBP", quality=88)
    print(f"  saved {out} ({os.path.getsize(out)//1024} KB)")
print("courier done")
