import faq from '../data/faq.json';
import site from '../data/site.json';
import { fillTokens } from './pricing';

const flags = site.business as Record<string, unknown>;

/** FAQ with {tokens} filled from the price config and flag-dependent sentences added. */
export const faqItems = faq.map((f) => ({
  q: f.q,
  a: fillTokens(f.a) + (f.extra && flags[f.extra.flag] ? ` ${f.extra.text}` : ''),
}));
