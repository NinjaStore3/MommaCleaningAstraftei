/**
 * Renders the raster brand assets and the flyer PDF with a headless Chromium.
 *
 *   npm run brand   → brand/png/*, brand/social/*, public/og.png, favicons
 *   npm run flyer   → flyer/astraftei-flyer-a5.pdf (+ PNG preview)
 *
 * Needs Chrome or Chromium. It tries, in order: $CHROME_PATH, an installed Google Chrome,
 * then Playwright's own Chromium (`npx playwright install chromium`).
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const r = (...p) => join(ROOT, ...p);
const site = JSON.parse(await readFile(r('src/data/site.json'), 'utf8'));
const pricing = JSON.parse(await readFile(r('src/data/pricing.json'), 'utf8'));

async function launch() {
  const tries = [
    process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH },
    { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' },
    { channel: 'chrome' },
    {},
  ].filter(Boolean);
  for (const opts of tries) {
    try {
      return await chromium.launch(opts);
    } catch {}
  }
  throw new Error('Δεν βρέθηκε Chrome/Chromium. Βάλε CHROME_PATH=/path/to/chrome ή τρέξε: npx playwright install chromium');
}

const b64 = async (p) => (await readFile(p)).toString('base64');
const fontFaces = async () => `
  @font-face{font-family:Literata;src:url(data:font/woff2;base64,${await b64(r('public/fonts/literata-greek.woff2'))}) format('woff2');font-weight:400 700;unicode-range:U+0370-03FF}
  @font-face{font-family:Literata;src:url(data:font/woff2;base64,${await b64(r('public/fonts/literata-latin.woff2'))}) format('woff2');font-weight:400 700;unicode-range:U+0000-036F,U+2000-20FF}
  @font-face{font-family:Commissioner;src:url(data:font/woff2;base64,${await b64(r('public/fonts/commissioner-greek.woff2'))}) format('woff2');font-weight:300 700;unicode-range:U+0370-03FF}
  @font-face{font-family:Commissioner;src:url(data:font/woff2;base64,${await b64(r('public/fonts/commissioner-latin.woff2'))}) format('woff2');font-weight:300 700;unicode-range:U+0000-036F,U+2000-20FF}`;

const svgFile = async (name) =>
  (await readFile(r('brand', name), 'utf8')).replace(/<title>.*?<\/title>\n?/, '').replace(/ width="[\d.]+" height="[\d.]+"/, '');

async function shoot(browser, html, out, w, h, { transparent = false } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
}

const doc = (css, body) =>
  `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}html,body{width:100%;height:100%}${css}</style></head><body>${body}</body></html>`;

/** Minimal .ico writer: PNG-compressed entries (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const o = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, o);
    header.writeUInt8(size >= 256 ? 0 : size, o + 1);
    header.writeUInt16LE(1, o + 4);
    header.writeUInt16LE(32, o + 6);
    header.writeUInt32LE(data.length, o + 8);
    header.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

async function brand() {
  const browser = await launch();
  await mkdir(r('brand/png'), { recursive: true });
  await mkdir(r('brand/social'), { recursive: true });
  const fonts = await fontFaces();

  // 1. Logo PNGs, transparent, longest side 512 and 1024.
  for (const name of ['logo', 'logo-dark', 'logo-stacked', 'logo-stacked-dark', 'mark', 'mark-dark']) {
    const svg = await readFile(r('brand', `${name}.svg`), 'utf8');
    const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
    for (const size of [512, 1024]) {
      const k = size / Math.max(vw, vh);
      const w = Math.round(vw * k);
      const h = Math.round(vh * k);
      await shoot(browser, doc('svg{display:block;width:100%;height:100%}', await svgFile(`${name}.svg`)), r('brand/png', `${name}-${size}.png`), w, h, {
        transparent: true,
      });
    }
  }

  // 2. Profile pictures (Instagram, Facebook, Viber, Google Business). They get cropped to a circle.
  for (const name of ['avatar', 'avatar-light']) {
    await shoot(browser, doc('svg{display:block;width:100%;height:100%}', await svgFile(`${name}.svg`)), r('brand/social', `${name}-1080.png`), 1080, 1080);
  }

  // 3. Favicons and app icons.
  const fav = await svgFile('favicon.svg');
  const icoParts = [];
  for (const size of [16, 32, 48]) {
    const out = r('brand/png', `favicon-${size}.png`);
    await shoot(browser, doc('svg{display:block;width:100%;height:100%}', fav), out, size, size, { transparent: true });
    icoParts.push({ size, data: await readFile(out) });
  }
  await writeFile(r('public/favicon.ico'), ico(icoParts));
  await copyFile(r('brand/favicon.svg'), r('public/favicon.svg'));
  const mark = await svgFile('mark.svg');
  const tile = (pad) =>
    doc(`body{background:#f7f4ee;display:grid;place-items:center}svg{width:${100 - pad * 2}%;height:${100 - pad * 2}%}`, mark);
  await shoot(browser, tile(12), r('public/apple-touch-icon.png'), 180, 180);
  await shoot(browser, tile(14), r('public/icon-192.png'), 192, 192);
  await shoot(browser, tile(14), r('public/icon-512.png'), 512, 512);

  // 4. Open Graph image (link previews in Viber, WhatsApp, Facebook) and Facebook cover.
  const std = pricing.services.standard.prices;
  const from = Math.min(...Object.values(std).filter((v) => typeof v === 'number'));
  const css = `${fonts}
    body{background:#f7f4ee;font-family:Commissioner;color:#1e2320;position:relative;overflow:hidden}
    .h{font-family:Literata;font-weight:560;letter-spacing:-.02em;line-height:1.02}
    .h em{font-style:normal;color:#1f4a40}
    .p{font-family:Literata;font-weight:600;color:#a84b24}
    .arch{position:absolute;background:#1f4a40;border-radius:1000px 1000px 0 0;display:grid;place-items:center}
    .arch svg{width:34%;height:auto}`;
  const glint =
    '<svg viewBox="0 0 20 20"><path fill="#e2be78" d="M10 0C10.3 3.6 11.4 7.7 16.2 10 11.4 12.3 10.3 16.4 10 20 9.7 16.4 8.6 12.3 3.8 10 8.6 7.7 9.7 3.6 10 0Z"/></svg>';
  const wordmark = await svgFile('wordmark.svg');
  await shoot(
    browser,
    doc(
      css,
      `<div style="position:absolute;left:72px;top:64px;width:330px">${wordmark}</div>
       <div class="h" style="position:absolute;left:72px;top:210px;font-size:74px;width:640px">Γυρνάτε σπίτι<br>και <em>αστράφτει.</em></div>
       <div style="position:absolute;left:72px;bottom:70px;font-size:28px;color:#525a55">Καθαρισμός σπιτιού στην Αθήνα, <span class="p" style="font-size:40px">από ${from}€</span></div>
       <div class="arch" style="right:80px;bottom:0;width:300px;height:470px">${glint}</div>`,
    ),
    r('public/og.png'),
    1200,
    630,
  );
  await shoot(
    browser,
    doc(
      css,
      `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:820px;text-align:center">
         <div style="width:520px;margin:0 auto 34px">${await svgFile('logo-stacked.svg')}</div>
         <div style="font-size:30px;color:#525a55">Κανονικός καθαρισμός <span class="p" style="font-size:40px">από ${from}€</span> · ${site.contact.phoneDisplay}</div>
       </div>
       <div class="arch" style="left:90px;bottom:0;width:150px;height:260px">${glint}</div>
       <div class="arch" style="right:90px;bottom:0;width:150px;height:260px">${glint}</div>`,
    ),
    r('brand/social/facebook-cover-1640x624.png'),
    1640,
    624,
  );
  await copyFile(r('public/og.png'), r('brand/social/og-1200x630.png'));

  await mkdir(r('public/brand'), { recursive: true });
  await copyFile(r('brand/logo-stacked-dark.svg'), r('public/brand/logo-stacked-dark.svg'));
  await browser.close();
  console.log('brand: done');
}

/** Tiny static server for dist/ so the flyer loads its fonts the same way the site does. */
async function serve(dir) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
  const server = createServer(async (req, res) => {
    let p = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    try {
      if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
      res.writeHead(200, { 'Content-Type': types[extname(p)] ?? 'application/octet-stream' });
      res.end(await readFile(p));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

async function flyer() {
  const { server, url } = await serve(r('dist'));
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto(`${url}/flyer/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await mkdir(r('flyer'), { recursive: true });
  await page.pdf({ path: r('flyer/astraftei-flyer-a5.pdf'), preferCSSPageSize: true, printBackground: true });
  await page.setViewportSize({ width: 700, height: 950 });
  await page.emulateMedia({ media: 'print' });
  await page.locator('.sheet').screenshot({ path: r('flyer/astraftei-flyer-a5-preview.png') });
  await browser.close();
  server.close();
  console.log('flyer: flyer/astraftei-flyer-a5.pdf');
}

const task = process.argv[2];
if (task === 'brand') await brand();
else if (task === 'flyer') await flyer();
else console.log('usage: node scripts/render.mjs brand|flyer');
