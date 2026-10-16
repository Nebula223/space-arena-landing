# GitHub Pages

Public repository: https://github.com/Nebula223/space-arena-landing

Site: https://nebula223.github.io/space-arena-landing/

## Routes

- `promo-full/index.html` — Concept D (the root URL redirects here).
- `promo-full/news-v2.html` — current News.
- `promo-full/news/update-331/`, `update-330/`, `limit-breakers/`, `space-legends/` — complete articles, each with a real `index.html`.
- `promo-full/faq-v2.html` — FAQ.
- `interactive-demo/index.html` — independent builder and scripted Canvas battle.
- `hangar/index.html` — retained original Hangar.
- `alternative/index.html` — alternative concept.
- `art-directions/index.html` — A / B / C comparison.
- `classic.html` — first landing concept.
- `START-HERE.html` — all demo entries, without changes to the main site menu.

Every path is relative to `/space-arena-landing/`. There is no SPA router, fallback trick or server: nested article directories contain HTML files and work after reload.

## Build and deployment

No npm dependencies, Vite, CMS or production server. GitHub Actions runs Node.js 24, the secret-pattern audit, `node scripts/build-pages.cjs`, `node scripts/check-pages.cjs`, and the official GitHub Pages actions pinned to inspected commit hashes. Only `dist/` is deployed, never the entire source repository. Pages settings use **GitHub Actions** as the publishing source.

The builder copies the existing runtime dependency graph and adds static entry/index files. Existing designs and interaction scripts are not rewritten. The oldest concept's `_PromoRes` URLs are remapped in the generated output to seven selected web images in `assets/legacy/` and the existing video; the source archive is not needed. Local fonts and their licenses are included.

Build from a fresh checkout (an existing nonempty `dist/` is deliberately rejected to prevent stale output):

```sh
node scripts/build-pages.cjs
node scripts/check-pages.cjs
```

## Update from an ordinary GitHub clone

```sh
git switch main
git pull --ff-only
# Edit the site files.
git add <changed-files>
git commit -m "Update Space Arena demo"
git push origin main
```

The workflow starts automatically. Check the green result in **Actions → Deploy Space Arena to GitHub Pages** before sharing new content. Manual redeploy is available through **Run workflow**.

## Update from the original design workspace

The original `design/concept-d` history includes working source material that is intentionally not public. Its history has not been rewritten. Do **not** push that branch or `--all` to GitHub.

```sh
git switch design/concept-d
git add <changed-files>
git commit -m "Update design"
node scripts/publish-pages.cjs --push
```

This creates/advances the local `publish/github-pages` branch with a source allowlist, then performs a normal fast-forward push to remote `main`. The initial public commit has no parent from the private design history. It does not change the working branch, delete files, or use force push. If remote `main` changed elsewhere, a non-fast-forward push is rejected: reconcile deliberately, never force it.

## Publication boundaries

Excluded: original brief PDF/Markdown, `_PromoRes`, reference archives, exports/ZIP, QA/screenshots, unused PNG/JPEG masters, machine-specific tests, local configuration, credentials, caches and dependencies. A heuristic scan of tracked text and local historical text was performed before first publication; this is not a mathematical guarantee of absence of secrets. No secret values are printed or stored by publication helpers.

WebGL remains unconnected because a real build/entry URL has not been supplied. The existing placeholder and future iframe integration are preserved. A future WebGL build may require framing permissions and server headers unavailable on ordinary Pages, especially cross-origin isolation for multithreading; assess the actual build before changing integration. The Canvas demo works independently and is not the real game.

The current illustrations include temporary concept art; content/legal-link approval remains the project owner's responsibility. No analytics, advertising SDKs or paid services were added.
