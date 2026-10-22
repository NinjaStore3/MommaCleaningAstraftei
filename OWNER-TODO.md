# Owner to-do before going live

Everything below is a placeholder or a decision only you (and she) can make. Most of it is one file: **`src/data/site.json`**. Run `npm run check:todo` to see what's still unfilled.

## Must do before launch

Done: company name Αστράφτει (no personal surname shown), first name (Ευγενία, since 1989), phone 690 825 2007 on Viber + WhatsApp, email, ΑΦΜ, ΔΟΥ, address, base area, all-Athens coverage, payment methods (μετρητά, τραπεζική μεταφορά), about text. The booking form needs no key: it opens WhatsApp/Viber/email with the message ready.

- [ ] **Working hours**: `contact.hours` (now "Δευτέρα–Σάββατο, 8:00–20:00"). Confirm with her.
- [ ] **Read the site with her**: especially the about section ("Ποια είμαι"), and change anything that isn't true for her.
- [ ] **Address on the site**: `Σμύρνης 3, 13562 Άγιοι Ανάργυροι` is shown in the footer and legal pages as the business seat. If that's her home and she'd rather not publish it, ask the accountant what's acceptable.
- [ ] **Domain / site address**: `url` is still `https://astraftei.gr`, which isn't registered yet. Canonical links, sitemap, link previews (Viber/WhatsApp/Facebook) and the flyer QR code all use it. Either register the domain, or set `url` to the live `*.workers.dev` address for now.
- [ ] **Photos** into `src/assets/photos/`: `hero.jpg`, `owner.jpg`, `kitchen.jpg`. Until then the site shows branded panels instead, so it looks finished. Use real photos of her and of homes she has cleaned (with the client's permission). See README → "Add photos".
- [ ] **Print the flyer only after the domain/URL is set**, so the QR code works: `npm run flyer`.

## Decisions to confirm with her

- [ ] **Prices** in `src/data/pricing.json`. See "Price check" below for what changed and why.
- [ ] **Late cancellation fee**: now half price if cancelled under 24 hours (`policies.lateCancelFee`). Set to `0` to drop it, and edit the FAQ/terms wording if needed.
- [ ] **Vacuum cleaner**: the FAQ says she uses the client's vacuum ("Ηλεκτρική σκούπα χρησιμοποιώ του σπιτιού"). Change it if she brings her own.
- [ ] **What she won't do**: terms page (`src/pages/oroi.astro`, "Εργασίες που δεν αναλαμβάνω"). Ladders, outside windows without safe access, heavy furniture, large mould jobs. Adjust.
- [ ] **Capacity line**: "αναλαμβάνω έως δύο σπίτια τη μέρα" in the about section. Keep it true.
- [ ] **Insurance**: once she has civil liability insurance, set `business.insurance: true` (FAQ and terms then mention it).
- [ ] **VAT**: prices are shown as final. If she's not in the small-business VAT exemption, VAT must be included in those prices. Ask the accountant.
- [ ] **Legal pages**: `oroi` and `politiki-aporritou` are plain-language drafts, not legal advice. Have the accountant (or a lawyer) glance at them.

## Optional

- [ ] Socials: `socials.instagram`, `socials.facebook`, `socials.google` (the Google Business Profile link). Icons appear in the footer when filled.
- [ ] Analytics: enable Cloudflare Web Analytics, then `analytics.cloudflare: true`.
- [ ] Reviews: when real ones exist, see README → "Reviews".
- [ ] Profile pictures: upload `brand/social/avatar-1080.png` to Viber, WhatsApp Business, Instagram, Facebook and Google Business. Facebook cover: `brand/social/facebook-cover-1640x624.png`.

## Price check (October 2026)

What I could find online for Athens:

- **Hourly rates:** independent cleaners and small agencies charge about **8–13€/hour**. Nannuka profiles run 8–15€ with an average around 10€. MrMaids-style agencies charge 9–10€/hour, often with a 6-hour minimum. One platform starts at 11€/hour. A 2026 price guide puts everyday cleaning at 8–12€/hour and deep cleaning at 10–15€/hour.
- **Deep clean, crew-based companies:** 120–300€+ for 100 τ.μ.
- **Airbnb turnovers** (average cleaning fee in Athens listings): studio ~30€, 1 bedroom ~33€, 2 bedrooms ~44€, 3 bedrooms ~61€.

What I did:

| Item | Handover | Site | Why |
| --- | --- | --- | --- |
| Standard clean | 45 / 60 / 75€ | **same** | ≈15€/hour. Top of the range, but materials are included, the price is fixed (no hourly minimum), there's a receipt and it's always the same person. The weekly plan works out to ≈12€/hour, mid-market. |
| Deep clean | 75 / 95 / 120€ | **same** | Already below crew-based companies. There's room to raise it once reviews come in. |
| Move-out | from 110€ | **same** | Reasonable for an empty home up to 90 τ.μ. |
| Airbnb | from 35€ | **35 / 45 / 60€** by size | Studio/1-bed kept at 35€. Added 2-bed (45€) and 3-bed (60€) in line with Athens averages. |
| Ironing | 15€/hour | **12€/hour** | Ironing is compared against plain hourly help (≈7–12€/hour); 15€ would stand out. |
| Other add-ons | as given | same | No good public data to argue with them. |

Sources: [psaxnwmastora.gr: Πόσο κοστίζει ο καθαρισμός σπιτιού το 2026](https://www.psaxnwmastora.gr/blog/poso-kostizei-katharismos-spitiou-2026) · [nannuka.com: housekeepers in Athens](https://www.nannuka.com/en/housekeeping/p/maid/l/Athens-center) · [meetamaid.gr](https://meetamaid.gr/athinaypiresies-katharismoy-spitioy-me-tin-oradiafaneis-times-kai-oikonomiko-kostos/) · [maids.gr](https://maids.gr/) · [bnbcalc.com: Athens market](https://www.bnbcalc.com/markets/gr/athens) · [expatistan.com](https://www.expatistan.com/price/cleaning-help/athens-greece)
