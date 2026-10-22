import { site, filled } from './site';
import { services, sizes, plans, planPrice, priceRange, addons, type SizeId } from './pricing';
import { faqItems } from './faq';

/** schema.org LocalBusiness with the price list as offers. Placeholders are left out. */
export function localBusiness() {
  const { min, max } = priceRange();
  const offers: object[] = [];
  const offer = (name: string, price: number, description?: string, from = false) =>
    offers.push({
      '@type': 'Offer',
      priceCurrency: 'EUR',
      ...(from
        ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: price, priceCurrency: 'EUR' } }
        : { price }),
      itemOffered: { '@type': 'Service', name, ...(description ? { description } : {}) },
    });

  for (const id of ['standard', 'deep', 'airbnb'] as const) {
    const s = services[id];
    for (const z of sizes) {
      const p = s.prices[z.id as SizeId];
      if (typeof p === 'number') offer(`${s.name}, ${z.label}`, p);
    }
  }
  offer(services.move.name, services.move.prices.s as number, services.move.fromNote, true);
  for (const p of plans) {
    for (const z of sizes) {
      const base = services.standard.prices[z.id as SizeId];
      if (typeof base === 'number') offer(`${services.standard.name}, ${p.name.toLowerCase()}, ${z.label}`, planPrice(base, p.discount), 'Τιμή ανά επίσκεψη');
    }
  }
  for (const a of addons) offer(a.name, a.price, a.perHour ? 'ανά ώρα' : undefined);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#business`,
    name: site.name,
    description: `Καθαρισμός σπιτιού σε όλη την Αθήνα από το ${site.owner.since}: κανονικός καθαρισμός, γενική καθαριότητα, μετακόμιση, Airbnb.`,
    url: site.url,
    logo: `${site.url}/icon-512.png`,
    image: `${site.url}/og.png`,
    telephone: site.contact.phone,
    priceRange: `${min}€–${max}€`,
    currenciesAccepted: 'EUR',
    paymentAccepted: site.payment.join(', '),
    address: {
      '@type': 'PostalAddress',
      ...(filled(site.business.street) ? { streetAddress: site.business.street } : {}),
      ...(filled(site.business.postalCode) ? { postalCode: site.business.postalCode } : {}),
      addressLocality: filled(site.business.locality) ? site.business.locality : 'Αθήνα',
      addressRegion: 'Αττική',
      addressCountry: 'GR',
    },
    areaServed: [
      { '@type': 'City', name: 'Αθήνα' },
      ...site.areas.groups.flatMap((g) => g.items.map((name) => ({ '@type': 'Place', name }))),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Τιμοκατάλογος',
      itemListElement: offers,
    },
  };
  if (filled(site.contact.email)) data.email = site.contact.email;
  if (filled(site.business.afm)) data.vatID = site.business.afm;
  const sameAs = Object.values(site.socials).filter((u) => filled(u));
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

export function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
