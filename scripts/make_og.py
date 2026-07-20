"""Generate the 1200x630 social share image (public/og-image.png).

Uses PIL with macOS system fonts (Georgia serif + Menlo mono) to echo the
site's Newsreader + IBM Plex Mono pairing. Run: python3 scripts/make_og.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

PAPER = (244, 238, 227)
INK = (28, 24, 20)
MUTED = (107, 97, 87)
SIGNAL = (228, 80, 42)
HAIRLINE = (216, 205, 187)
SUNK = (237, 230, 216)

W, H = 1200, 630
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_B = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
GEORGIA_I = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
MENLO = "/System/Library/Fonts/Menlo.ttc"

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")


def font(path, size):
    return ImageFont.truetype(path, size)


def main():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    pad = 72
    # frame
    d.rectangle([pad - 24, pad - 24, W - pad + 24, H - pad + 24], outline=HAIRLINE, width=2)

    # kicker (mono)
    kick = font(MENLO, 22)
    d.text((pad, pad), "A  V I S U A L   E X P L A I N E R", font=kick, fill=MUTED)

    # title (serif) — "Inside an " ink + "LLM" signal italic
    title = font(GEORGIA_B, 108)
    title_i = font(GEORGIA_I, 108)
    y = pad + 58
    d.text((pad, y), "Inside an ", font=title, fill=INK)
    w1 = d.textlength("Inside an ", font=title)
    d.text((pad + w1, y), "LLM", font=title_i, fill=SIGNAL)

    # subtitle (serif)
    sub = font(GEORGIA, 40)
    d.text((pad, y + 150), "How large language models actually work —", font=sub, fill=INK)
    d.text((pad, y + 200), "built from scratch, every demo a real model.", font=sub, fill=INK)

    # token chips row
    chips = ["Write", "me", "a", "poem", "about", "the", "sea"]
    cf = font(MENLO, 24)
    cx = pad
    cy = H - pad - 6
    for c in chips:
        tw = d.textlength(c, font=cf)
        d.rounded_rectangle([cx, cy, cx + tw + 28, cy + 46], radius=8, fill=SUNK, outline=HAIRLINE)
        d.text((cx + 14, cy + 9), c, font=cf, fill=INK)
        cx += tw + 28 + 10

    # url (mono, top right)
    urlf = font(MENLO, 22)
    url = "vivekally.github.io/inside-an-llm"
    uw = d.textlength(url, font=urlf)
    d.text((W - pad - uw, pad), url, font=urlf, fill=SIGNAL)

    img.save(OUT)
    print(f"wrote {OUT}  ({os.path.getsize(OUT)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
