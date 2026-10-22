// @ts-check
import { defineConfig } from 'astro/config';
import site from './src/data/site.json' with { type: 'json' };

export default defineConfig({
  site: site.url,
  trailingSlash: 'ignore',
  build: {
    // Inline the (small) CSS into each page: one less request before first paint.
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
});
