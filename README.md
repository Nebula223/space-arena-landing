# Space Arena landing

## Current demonstration

Concept D: `promo-full/index.html`; News: `promo-full/news-v2.html`; FAQ: `promo-full/faq-v2.html`; Interactive Demo: `interactive-demo/index.html`. Earlier concepts are retained.

GitHub Pages build, direct routes, safe publication boundaries and update instructions: [DEPLOYMENT.md](DEPLOYMENT.md).

Static HTML / CSS / JavaScript. No build step required.

## Preview

Run `node preview.cjs` in this directory, then open http://127.0.0.1:4173.

## Content and responsive behavior

- Desktop: above 1024px. Tablet: 769–1024px. Mobile: up to 768px, with refinements below 480px.
- All visible copy is available in English and Russian. Language preference is saved locally.
- News, webshop, wiki and socials open their external destinations. Download scrolls to the app stores.
- Play for free currently opens a temporary download notice. Replace that event handler in `script.js` when the WebGL launch contract is available.
- The engineering block illustrates module categories; it is not a functional game ship editor.
- Store gallery artwork is preserved in full, including English text embedded in official images. See `assets/SOURCES.md`.

## Validation

`node verify.cjs` runs local browser checks on 1440, 1024, 768, 390 and 320px with the bundled Playwright and installed Edge. Preview images are written to `qa/`. The helper uses this workstation's bundled runtime path; the website itself has no dependency on it.

Google Fonts supplies Manrope and Russo One. System font fallbacks apply when offline.
