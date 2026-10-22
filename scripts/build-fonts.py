"""Builds the self-hosted font files in public/fonts/ from the @fontsource packages.

Only needed if you want to rebuild the fonts (they are already committed).
Requires: pip install fonttools brotli
Run from the project root: python3 scripts/build-fonts.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
FS = ROOT / "node_modules" / "@fontsource-variable"
OUT = ROOT / "public" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

# Basic Latin plus the punctuation Greek text actually uses (« » · – — ’ “ ” … €).
LATIN = "U+0020-007E,U+00A0,U+00A9,U+00AB,U+00B0,U+00B7,U+00BB,U+00BD,U+00D7,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2192,U+2212"
GREEK = "U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF"

JOBS = [
    # (source file, output name, unicodes, axis limits)
    ("literata/files/literata-greek-opsz-normal.woff2", "literata-greek.woff2", GREEK, {"opsz": 36, "wght": (400, 700)}),
    ("literata/files/literata-latin-opsz-normal.woff2", "literata-latin.woff2", LATIN, {"opsz": 36, "wght": (400, 700)}),
    ("commissioner/files/commissioner-greek-wght-normal.woff2", "commissioner-greek.woff2", GREEK, {"wght": (300, 700)}),
    ("commissioner/files/commissioner-latin-wght-normal.woff2", "commissioner-latin.woff2", LATIN, {"wght": (300, 700)}),
]

def fix_kerning(font, pairs):
    """Literata ships a large positive kern between Υ and λ ("Υ λικά"). Zero out such pairs."""
    if "GPOS" not in font:
        return
    cmap = font.getBestCmap()
    for a, b in pairs:
        ga, gb = cmap.get(ord(a)), cmap.get(ord(b))
        if not ga or not gb:
            continue
        for lookup in font["GPOS"].table.LookupList.Lookup:
            for st in lookup.SubTable:
                if lookup.LookupType == 9:
                    st = st.ExtSubTable
                if getattr(st, "LookupType", lookup.LookupType) != 2 or ga not in st.Coverage.glyphs:
                    continue
                if st.Format == 1:
                    recs = [r for r in st.PairSet[st.Coverage.glyphs.index(ga)].PairValueRecord if r.SecondGlyph == gb]
                else:
                    c1 = st.ClassDef1.classDefs.get(ga, 0)
                    c2 = st.ClassDef2.classDefs.get(gb, 0)
                    recs = [st.Class1Record[c1].Class2Record[c2]] if c2 else []
                for r in recs:
                    v = r.Value1
                    if v is not None and getattr(v, "XAdvance", 0) > 0:
                        print(f"  fixed kern {a}{b}: {v.XAdvance} -> 0")
                        v.XAdvance = 0
                        if hasattr(v, "XAdvDevice"):
                            del v.XAdvDevice


BAD_PAIRS = [("Υ", "λ"), ("Ύ", "λ"), ("Ϋ", "λ")]

for src, name, unicodes, limits in JOBS:
    font = TTFont(FS / src, lazy=False)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(unicodes))
    sub.subset(font)
    fix_kerning(font, BAD_PAIRS)
    font = instancer.instantiateVariableFont(font, limits)
    font.flavor = "woff2"
    font.save(OUT / name)
    print(f"{name}: {(OUT / name).stat().st_size / 1024:.1f} KB")
