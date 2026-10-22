/// <reference types="astro/client" />

// qrcode ships without type definitions; it's only used at build time in the flyer page.
declare module 'qrcode';
