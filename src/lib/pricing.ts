import pricing from '../data/pricing.json';
import site from '../data/site.json';

export type SizeId = 's' | 'm' | 'l' | 'xl';
export type ServiceId = 'standard' | 'deep' | 'move' | 'airbnb' | 'renovation';

export const sizes = pricing.sizes as { id: SizeId; label: string; short: string }[];
export const plans = pricing.plans;
export const addons = pricing.addons;
export const policies = pricing.policies;
export const services = pricing.services;

/** "45€" — euro sign right after the number, no space. */
export const euro = (n: number) => `${n}€`;

/** Plan price per visit: base × (1 − discount), rounded to whole euros. */
export const planPrice = (base: number, discount: number) => Math.round(base * (1 - discount));

/** "−15%" with a real minus sign. */
export const pct = (discount: number) => `−${Math.round(discount * 100)}%`;

/** 6.5 → "6,5" (Greek decimal comma). */
export const num = (n: number) => String(n).replace('.', ',');

/** "~3 ώρες", "~1 ώρα", "~6,5 ώρες" */
export const hoursLabel = (h: number) => `~${num(h)} ${h === 1 ? 'ώρα' : 'ώρες'}`;

export const standardPrice = (size: SizeId) => services.standard.prices[size] as number | null;

/** Cheapest and most expensive fixed prices on the site (for "από 45€" and JSON-LD priceRange). */
export function priceRange() {
  const all: number[] = [];
  for (const s of Object.values(services)) {
    if ('prices' in s) for (const v of Object.values(s.prices)) if (typeof v === 'number') all.push(v);
  }
  return { min: Math.min(...all), max: Math.max(...all) };
}

/** Lowest price of a service across sizes. */
export function fromPrice(id: ServiceId) {
  const s = services[id];
  if (!('prices' in s)) return null;
  const vals = Object.values(s.prices).filter((v): v is number => typeof v === 'number');
  return vals.length ? Math.min(...vals) : null;
}

/** "μετρητά, IRIS ή κάρτα" */
export function listOr(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ή ${items[items.length - 1]}`;
}

/** "το 50% της τιμής" (same form as subject or object). */
export const lateCancelText = (fee: number) => `το ${Math.round(fee * 100)}% της τιμής`;

/** "3 με 5" — shortest to longest estimated duration of a service. */
export function hoursSpan(id: 'standard' | 'deep') {
  const hs = Object.values(services[id].hours).filter((h): h is number => typeof h === 'number');
  return `${num(Math.min(...hs))} με ${num(Math.max(...hs))}`;
}

/** Fills {tokens} in FAQ answers from the config, so the FAQ never disagrees with the price list. */
export function fillTokens(text: string) {
  return text
    .replaceAll('{hoursStandard}', hoursSpan('standard'))
    .replaceAll('{hoursDeep}', hoursSpan('deep'))
    .replaceAll('{ownMaterialsDiscount}', euro(policies.ownMaterialsDiscount))
    .replaceAll('{freeCancelHours}', String(policies.freeCancelHours))
    .replaceAll('{lateCancel}', lateCancelText(policies.lateCancelFee))
    .replaceAll('{payment}', listOr(site.payment));
}
