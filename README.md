# Space Arena Landing

Static HTML, CSS and JavaScript demonstration site. No npm dependencies, Vite, CMS or production server.

**Demo:** https://nebula223.github.io/space-arena-landing/

## Pages

- [Concept D](https://nebula223.github.io/space-arena-landing/promo-full/index.html)
- [News and complete articles](https://nebula223.github.io/space-arena-landing/promo-full/news-v2.html)
- [FAQ](https://nebula223.github.io/space-arena-landing/promo-full/faq-v2.html)
- [Interactive Demo — ship builder and scripted battle](https://nebula223.github.io/space-arena-landing/interactive-demo/index.html)
- [All concepts](https://nebula223.github.io/space-arena-landing/START-HERE.html)

The original Hangar, alternative landing and art directions A / B / C are preserved. Every nested article has a real HTML entry point and supports direct navigation/reload.

## Local preview

Run `node preview.cjs`, then open `http://127.0.0.1:4173/promo-full/index.html` or `http://127.0.0.1:4173/interactive-demo/index.html`.

## GitHub Pages

Actions builds the audited static dependency graph into `dist/`, checks local links, then deploys it to Pages. The root redirects to Concept D; the earliest landing remains available as `classic.html` in the generated site.

Build from a fresh checkout with Node.js 24:

```sh
node scripts/build-pages.cjs
node scripts/check-pages.cjs
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for direct routes, Git update commands and the separate sanitized publication branch used by the original design workspace. Do not push the private design history with `git push --all`.

## Demo boundaries

RU/EN and responsive layouts are retained. Interactive Demo is an illustrative, scripted Canvas concept, not the actual game balance or AI. WebGL is not connected because a build/entry URL has not been supplied; the existing placeholder remains intact.

Game images and branding belong to their respective rights holders. Some promotional illustrations are temporary concept artwork. Local font licenses are included beside their assets. Working archives, the original brief, references, unused masters, local QA, caches and secrets are not included in the public snapshot.
