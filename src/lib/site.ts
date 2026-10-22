import site from '../data/site.json';

export { site };

/** Values still in [brackets] are placeholders the owner has not filled in yet. */
export const isPlaceholder = (v: unknown) => typeof v === 'string' && /^\[.*\]$/.test(v.trim());
export const filled = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v);

const digits = site.contact.phone.replace(/[^\d]/g, '');

export const links = {
  tel: `tel:${site.contact.phone}`,
  viber: (text?: string) =>
    `viber://chat?number=%2B${digits}${text ? `&draft=${encodeURIComponent(text)}` : ''}`,
  whatsapp: (text?: string) => `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  mail: (subject?: string, body?: string) => {
    const q = new URLSearchParams();
    if (subject) q.set('subject', subject);
    if (body) q.set('body', body);
    const qs = q.toString().replaceAll('+', '%20');
    return `mailto:${site.contact.email}${qs ? `?${qs}` : ''}`;
  },
};

export const hasEmail = filled(site.contact.email);
