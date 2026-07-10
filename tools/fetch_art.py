"""Art courier: runs on GitHub Actions (full internet), downloads card art
from the manifest, converts to optimized webp in public/art/.
Video entries (id starts with "vid-"): downloaded and compressed via ffmpeg
to 1280w h264 mp4, muted, faststart, ~seamless-loop friendly."""
import json, io, os, subprocess, tempfile
import requests
from PIL import Image

manifest = json.load(open("tools/art-manifest.json"))
os.makedirs("public/art", exist_ok=True)
for card_id, url in manifest.items():
    if card_id.startswith("vid-") or card_id.startswith("video-") or url.split("?")[0].endswith((".mp4", ".webm", ".mov")):
        out_mp4 = f"public/art/{card_id}.mp4"
        out_webm = f"public/art/{card_id}.webm"
        if os.path.exists(out_mp4) and os.path.exists(out_webm):
            print(f"skip {card_id} (exists)")
            continue
        print(f"fetching video {card_id} ...")
        r = requests.get(url, timeout=180)
        r.raise_for_status()
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tf:
            tf.write(r.content); src = tf.name
        if not os.path.exists(out_mp4):
            subprocess.run([
                "ffmpeg", "-y", "-i", src, "-an",
                "-vf", "scale=1280:-2",
                "-c:v", "libx264", "-crf", "27", "-preset", "slow",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", out_mp4
            ], check=True)
            print(f"  saved {out_mp4} ({os.path.getsize(out_mp4)//1024} KB)")
        if not os.path.exists(out_webm):
            subprocess.run([
                "ffmpeg", "-y", "-i", src, "-an",
                "-vf", "scale=1280:-2",
                "-c:v", "libvpx-vp9", "-crf", "37", "-b:v", "0", "-row-mt", "1",
                out_webm
            ], check=True)
            print(f"  saved {out_webm} ({os.path.getsize(out_webm)//1024} KB)")
        os.unlink(src)
        continue
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
