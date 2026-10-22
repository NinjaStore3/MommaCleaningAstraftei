"""Generates the logo SVGs in brand/ (text converted to outlines, no font needed).

Only needed if you change the logo. Requires: pip install fonttools brotli uharfbuzz
Run from the project root: python3 scripts/build-logo.py
Then: npm run brand   (exports PNGs, favicons, social images)
"""
import io
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
FS = ROOT / "node_modules" / "@fontsource-variable"
OUT = ROOT / "brand"

GREEN = "#1F4A40"
INK = "#1E2320"
LIME = "#F7F4EE"
TERRA = "#A84B24"
GOLD = "#E2BE78"


def load(paths, axes):
    """Instance one or more subset files of the same family at fixed axes."""
    fonts = []
    for p in paths:
        f = TTFont(FS / p, lazy=False)
        f = instancer.instantiateVariableFont(f, axes)
        buf = io.BytesIO()
        f.flavor = None
        f.save(buf)
        data = buf.getvalue()
        fonts.append((TTFont(io.BytesIO(data)), hb.Font(hb.Face(data))))
    return fonts


def shape(fonts, text, size, tracking=0.0):
    """Returns (svg path d, width, bounds) for text at font size `size`, baseline at y=0."""
    d_parts = []
    x = 0.0
    xmin = ymin = 1e9
    xmax = ymax = -1e9
    for ch in text:
        for tt, hbf in fonts:
            if ord(ch) in tt.getBestCmap():
                break
        upem = tt["head"].unitsPerEm
        scale = size / upem
        buf = hb.Buffer()
        buf.add_str(ch)
        buf.guess_segment_properties()
        hb.shape(hbf, buf, {"kern": True, "liga": True})
        gs = tt.getGlyphSet()
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            name = tt.getGlyphName(info.codepoint)
            pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
            # flip y (font units are y-up, SVG is y-down)
            tpen = TransformPen(pen, (scale, 0, 0, -scale, x + pos.x_offset * scale, -pos.y_offset * scale))
            gs[name].draw(tpen)
            if pen.getCommands():
                d_parts.append(pen.getCommands())
            bp = BoundsPen(gs)
            gs[name].draw(bp)
            if bp.bounds:
                bx0, by0, bx1, by1 = bp.bounds
                xmin = min(xmin, x + bx0 * scale)
                xmax = max(xmax, x + bx1 * scale)
                ymin = min(ymin, -by1 * scale)
                ymax = max(ymax, -by0 * scale)
            x += pos.x_advance * scale + tracking * size
    return " ".join(d_parts), x - tracking * size, (xmin, ymin, xmax, ymax)


def glyph_box(fonts, text, size, index):
    """Bounds of the index-th character when `text` is laid out (for placing the glint)."""
    _, w0, _ = shape(fonts, text[:index], size)
    _, _, b = shape(fonts, text[index], size)
    return (w0 + b[0], b[1], w0 + b[2], b[3])


def glint(cx, cy, r, w=0.62, pinch=0.16):
    """Four-point glint: tall vertical ray, shorter horizontal ray, concave sides."""
    rx = r * w
    k = r * pinch
    return (
        f"M{cx:.2f} {cy - r:.2f}"
        f"C{cx + k * 0.35:.2f} {cy - k * 1.6:.2f} {cx + k * 1.6:.2f} {cy - k * 0.35:.2f} {cx + rx:.2f} {cy:.2f}"
        f"C{cx + k * 1.6:.2f} {cy + k * 0.35:.2f} {cx + k * 0.35:.2f} {cy + k * 1.6:.2f} {cx:.2f} {cy + r:.2f}"
        f"C{cx - k * 0.35:.2f} {cy + k * 1.6:.2f} {cx - k * 1.6:.2f} {cy + k * 0.35:.2f} {cx - rx:.2f} {cy:.2f}"
        f"C{cx - k * 1.6:.2f} {cy - k * 0.35:.2f} {cx - k * 0.35:.2f} {cy - k * 1.6:.2f} {cx:.2f} {cy - r:.2f}Z"
    )


def arch(x, y, w, h):
    """Doorway arch: rectangle with a semicircular top. (x, y) is the top-left of the bounding box."""
    r = w / 2
    return (
        f"M{x:.2f} {y + h:.2f}V{y + r:.2f}"
        f"A{r:.2f} {r:.2f} 0 0 1 {x + w:.2f} {y + r:.2f}"
        f"V{y + h:.2f}Z"
    )


def framed_arch(x, y, w, h, sw):
    """Arch outline (a doorway / window frame) as one even-odd path."""
    r = w / 2
    ix, iw = x + sw, w - 2 * sw
    ir = iw / 2
    outer = f"M{x:.2f} {y + h:.2f}V{y + r:.2f}A{r:.2f} {r:.2f} 0 0 1 {x + w:.2f} {y + r:.2f}V{y + h:.2f}Z"
    inner = f"M{ix:.2f} {y + h - sw:.2f}V{y + r:.2f}A{ir:.2f} {ir:.2f} 0 0 1 {ix + iw:.2f} {y + r:.2f}V{y + h - sw:.2f}Z"
    return outer + inner


def mark_paths(x, y, size):
    """Framed arch with a glint inside, in a size×size box. Returns (arch d, glint d)."""
    aw = size * 0.64
    ah = size * 0.86
    ax = x + (size - aw) / 2
    ay = y + (size - ah) / 2
    sw = size * 0.1
    g = glint(ax + aw / 2, ay + aw / 2 + size * 0.05, aw * 0.3)
    return framed_arch(ax, ay, aw, ah, sw), g


def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">\n'
        f"<title>{title}</title>\n{body}\n</svg>\n"
    )


serif = load(["literata/files/literata-greek-opsz-normal.woff2", "literata/files/literata-latin-opsz-normal.woff2"], {"opsz": 72, "wght": 560})
sans = load(["commissioner/files/commissioner-greek-wght-normal.woff2", "commissioner/files/commissioner-latin-wght-normal.woff2"], {"wght": 560})

WORD = "Αστραφτει"  # the τόνος on ά is drawn as the glint
WSIZE = 100
TAG = "ΚΑΘΑΡΙΣΜΟΣ ΣΠΙΤΙΟΥ · ΑΘΗΝΑ"

word_d, word_w, word_b = shape(serif, WORD, WSIZE, tracking=-0.005)
alpha = glyph_box(serif, WORD, WSIZE, 4)  # the second α
# Where a τόνος would sit: above the α, nudged right.
gx = (alpha[0] + alpha[2]) / 2 + WSIZE * 0.07
gy = alpha[1] - WSIZE * 0.18
glint_d = glint(gx, gy, WSIZE * 0.15)
word_top = min(word_b[1], gy - WSIZE * 0.15)
word_bottom = word_b[3]

tag_size = WSIZE * 0.2
tag_d, tag_w, tag_b = shape(sans, TAG, tag_size, tracking=0.16)


def wordmark_group(ox, oy, fg, accent, tag_fg, tag_dx=0.0, show_tag=True):
    """Wordmark with baseline at oy, starting at ox."""
    parts = [
        f'<g transform="translate({ox:.2f} {oy:.2f})">',
        f'<path fill="{fg}" d="{word_d}"/>',
        f'<path fill="{accent}" d="{glint_d}"/>',
    ]
    if show_tag:
        parts.append(f'<path fill="{tag_fg}" transform="translate({tag_dx:.2f} {WSIZE * 0.52:.2f})" d="{tag_d}"/>')
    parts.append("</g>")
    return "\n".join(parts)


def write(name, content):
    (OUT / name).write_text(content, encoding="utf-8")
    print("wrote", name)


THEMES = {
    "": dict(fg=GREEN, accent=TERRA, tag=INK, arch=GREEN, glint=TERRA),
    "-dark": dict(fg=LIME, accent=GOLD, tag=LIME, arch=LIME, glint=GOLD),
}

pad = WSIZE * 0.12
for suffix, t in THEMES.items():
    # Horizontal: mark left, wordmark + tagline right.
    word_h = (WSIZE * 0.52 + tag_b[3]) - word_top
    msize = word_h * 1.02
    gap = WSIZE * 0.3
    tw = max(word_w, tag_w)
    W = pad * 2 + msize + gap + tw
    H = pad * 2 + word_h
    a_d, g_d = mark_paths(pad, pad + (word_h - msize) / 2, msize)
    body = "\n".join([
        f'<path fill="{t["arch"]}" fill-rule="evenodd" d="{a_d}"/>',
        f'<path fill="{t["glint"]}" d="{g_d}"/>',
        wordmark_group(pad + msize + gap, pad - word_top, t["fg"], t["accent"], t["tag"]),
    ])
    write(f"logo{suffix}.svg", svg(W, H, body, "Αστράφτει — καθαρισμός σπιτιού, Αθήνα"))

    # Wordmark only (no mark), used in the site header next to the mark.
    W2 = pad * 2 + tw
    body = wordmark_group(pad, pad - word_top, t["fg"], t["accent"], t["tag"])
    write(f"wordmark{suffix}.svg", svg(W2, H, body, "Αστράφτει — καθαρισμός σπιτιού, Αθήνα"))

    # Wordmark without the tagline, tightly cropped (site header).
    pw = word_b[2] - word_b[0]
    ph = word_bottom - word_top
    body = wordmark_group(-word_b[0] + 1, -word_top + 1, t["fg"], t["accent"], t["tag"], show_tag=False)
    write(f"wordmark-plain{suffix}.svg", svg(pw + 2, ph + 2, body, "Αστράφτει"))

    # Stacked: mark on top, centered wordmark, centered tagline.
    msize = WSIZE * 1.15
    W3 = pad * 2 + tw
    gap = WSIZE * 0.22
    H3 = pad * 2 + msize + gap + word_h
    a_d, g_d = mark_paths((W3 - msize) / 2, pad, msize)
    body = "\n".join([
        f'<path fill="{t["arch"]}" fill-rule="evenodd" d="{a_d}"/>',
        f'<path fill="{t["glint"]}" d="{g_d}"/>',
        wordmark_group((W3 - word_w) / 2, pad + msize + gap - word_top, t["fg"], t["accent"], t["tag"], tag_dx=(word_w - tag_w) / 2),
    ])
    write(f"logo-stacked{suffix}.svg", svg(W3, H3, body, "Αστράφτει — καθαρισμός σπιτιού, Αθήνα"))

    # Square mark, transparent background.
    a_d, g_d = mark_paths(0, 0, 64)
    body = f'<path fill="{t["arch"]}" fill-rule="evenodd" d="{a_d}"/>\n<path fill="{t["glint"]}" d="{g_d}"/>'
    write(f"mark{suffix}.svg", svg(64, 64, body, "Αστράφτει"))

# Avatars: full-bleed squares for Instagram / Facebook / Viber / Google (they crop to a circle,
# so the mark stays inside the middle ~60%).
a_d, g_d = mark_paths(256 * 0.2, 256 * 0.2, 256 * 0.6)
write("avatar.svg", svg(256, 256, f'<rect width="256" height="256" fill="{GREEN}"/>\n<path fill="{LIME}" fill-rule="evenodd" d="{a_d}"/>\n<path fill="{GOLD}" d="{g_d}"/>', "Αστράφτει"))
write("avatar-light.svg", svg(256, 256, f'<rect width="256" height="256" fill="{LIME}"/>\n<path fill="{GREEN}" fill-rule="evenodd" d="{a_d}"/>\n<path fill="{TERRA}" d="{g_d}"/>', "Αστράφτει"))

# Favicon: the mark on a rounded limestone tile so it stays visible on dark browser tabs.
fa, fg_ = mark_paths(2, 2, 60)
write("favicon.svg", svg(64, 64, f'<rect width="64" height="64" rx="14" fill="{LIME}"/>\n<path fill="{GREEN}" fill-rule="evenodd" d="{fa}"/>\n<path fill="{TERRA}" d="{fg_}"/>', "Αστράφτει"))
