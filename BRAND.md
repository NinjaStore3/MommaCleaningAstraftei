# Αστράφτει — brand

**Name:** Αστράφτει ("it sparkles"). It's what every Greek says about a spotless house, it's easy to say on the phone, and it's the punchline of the headline: *Γυρνάς σπίτι και αστράφτει.*

**Feel:** warm, clean, Mediterranean, trustworthy. Limestone and cypress, not hospital white or startup purple. One real person, not a company.

## Logo

The **mark** is a doorway arch (home, Cycladic arch, a window letting light in) with a four-point **glint** inside. In the **wordmark**, the accent on the ά of Αστράφτει is drawn as the same glint. The glint is the one element that ties everything together. Use it sparingly elsewhere.

| File | Use |
| --- | --- |
| `brand/logo.svg` / `logo-dark.svg` | Horizontal: mark + wordmark + tagline. Default. |
| `brand/logo-stacked.svg` / `-dark` | Stacked, centred. Square-ish spaces, footer, flyer covers. |
| `brand/wordmark.svg` / `-dark` | Wordmark + tagline, no mark. |
| `brand/wordmark-plain.svg` / `-dark` | Wordmark only. Site header. |
| `brand/mark.svg` / `mark-dark.svg` | The arch alone, transparent background. |
| `brand/favicon.svg` | Arch on a rounded limestone tile (stays visible on dark browser tabs). |
| `brand/avatar.svg` / `avatar-light.svg` | Full-bleed square for profile pictures. |
| `brand/png/*-512.png`, `*-1024.png` | PNG exports of all of the above, transparent. |
| `brand/social/avatar-1080.png` | **Profile picture** for Instagram, Facebook, Viber, Google Business (green). `avatar-light-1080.png` is the light alternative. |
| `brand/social/facebook-cover-1640x624.png` | Facebook cover. |
| `brand/social/og-1200x630.png` | Link preview image (same as `public/og.png`). |

- `-dark` versions are for green or dark backgrounds (limestone letters, gold glint).
- Clear space around the logo: at least the height of the arch's top curve.
- Minimum size: horizontal logo 120 px wide on screen / 30 mm in print. Mark alone: 16 px.
- Don't: recolour the wordmark outside the palette, stretch it, add shadows or gradients, or put the light version on a busy photo.

All logo text is converted to outlines, so the files need no fonts. To change the logo, edit `scripts/build-logo.py` and run it, then `npm run brand` for the PNGs.

## Colours

Defined as CSS variables in `src/styles/global.css`.

| Name | Hex | Use |
| --- | --- | --- |
| Limestone | `#F7F4EE` | Page background |
| Sand | `#EFE9DF` | Alternate sections |
| Paper | `#FFFDF9` | Cards, form |
| Line | `#DDD5C8` | Hairlines, borders |
| Ink | `#1E2320` | Text (14.5:1 on limestone) |
| Ink soft | `#525A55` | Secondary text (6.5:1) |
| **Cypress green** (primary) | `#1F4A40` | Logo, headings accents, selected states, footer (9:1) |
| Green deep | `#163A32` | Footer, mobile bar |
| Green tint | `#E3ECE7` | Photo placeholders, highlights |
| **Terracotta** (accent) | `#A84B24` | Prices, main buttons, the glint. Use sparingly (5.2:1; white on it 5.7:1) |
| Gold | `#E2BE78` | The glint and prices **on green only** |

Rule of thumb: mostly limestone + ink, green for structure, terracotta only where you want the eye to go (price, "Κλείσε ραντεβού").

## Fonts

Both have a real Greek character set (accents, dialytika, uppercase) and are free (SIL Open Font License).

- **Literata**: headings, prices, numbers. Weight ~560–600. Warm book serif.
- **Commissioner**: body text, buttons, labels. Weight 400 / 500 / 600. Designed by a Greek type designer.

Test string, checked in the browser with no fallback glyphs: `Αστράφτει — Γενικός καθαρισμός, ψυγείο, φούρνος, τζάμια. ΆΈΉΊΌΎΏ ϊΐϋΰ 45€`

On the site they're self-hosted as small Greek + Latin subsets (`public/fonts/`, ~75 KB total), with `font-display: swap` and the Greek files preloaded. For other tools (Canva, Word), download them free from Google Fonts.

## Greek typography

- `lang="el"` everywhere, so browsers drop the accents correctly when uppercasing (ΤΙΜΕΣ, not ΤΙΜΈΣ; ΡΟΛΟΪ keeps its dialytika).
- Uppercase only for short labels (eyebrows, footer headings), letter-spaced.
- Euro sign after the number, no space: `45€`. Decimal comma: `6,5 ώρες`. Ranges with an en dash: `61–90 τ.μ.`
- Minus sign for discounts: `−15%`.

## Voice

Professional and warm. She speaks in the first person singular (one person, always the same one). Visitors are addressed politely in the plural (εσείς). Clear Greek, short sentences, specific facts over adjectives: 37 years, receipt every visit, price agreed before starting.

- ✓ «Είμαι η Ευγενία και καθαρίζω σπίτια στην Αθήνα από το 1989. Στο σπίτι σας έρχομαι πάντα εγώ, με δικά μου υλικά.»
- ✓ «Αν δεν απαντήσω, βρίσκομαι σε δουλειά και θα σας καλέσω μόλις τελειώσω.»
- ✗ Slang or overly casual lines («χωρίς πολλά-πολλά», «ζωάκι»).
- ✗ «Η εταιρεία μας δεσμεύεται να παρέχει υψηλής ποιότητας υπηρεσίες καθαρισμού.»
- ✗ «Αξιοπιστία – Ποιότητα – Συνέπεια», «Ανακαλύψτε…», «Καλώς ήρθατε…»

Never promise teams, same-day availability or "24/7". She works alone, at most two homes a day.
