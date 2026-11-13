# Juscelio Diaz — Portfolio

Live: https://jdiaz.vercel.app (German: https://jdiaz.vercel.app/de/)

Static site: plain HTML, CSS and JavaScript, no framework. **Open `index.html` in a browser.**
Node is only needed for `npm run build` (SEO tags, German pages, sitemap) and the formatter.

## Languages

English pages live in the root and are the source of truth. `npm run build` regenerates:

- `de/*.html` — German pages, translated with `i18n/de.json` (an English string missing from the
  dictionary stays in English, so add new strings there when you change copy);
- the SEO block in every page's `<head>`: canonical, `hreflang` en/de/x-default, Open Graph, Twitter card,
  Berlin geo tags and JSON-LD (Person) on home and CV;
- `sitemap.xml` with en/de alternates.

Each page has an **EN / DE** switch (`a[data-lang-switch]`); the build points it at the same page in the other language.
Never edit `de/` by hand — it is overwritten.

## Share images

`npm run og` writes `assets/img/og/og-*.jpg` (1200×630), one per page, from the page covers.

## Pages

| File                 | What it is                                                                          |
| -------------------- | ----------------------------------------------------------------------------------- |
| `index.html`         | Home: full-screen reel, name, tagline, "enter"                                      |
| `projects.html`      | The four project cards, corner links (home, CV, Instagram, LinkedIn), award overlay |
| `automotive.html`    | Tile grid + lightbox                                                                |
| `archviz.html`       | Tile grid + lightbox                                                                |
| `vr-realtime.html`   | Showreel (Vimeo, plays on click), then Yacht / ArchViz Configurator + tool cards    |
| `ai-generative.html` | Square tile grid (images + video) + lightbox                                        |
| `cv.html`            | CV ("Download PDF" prints it as A4)                                                 |
| `404.html`           | Not-found page (served by the host for missing URLs)                                |

## Structure

```
assets/
├── css/
│   ├── base.css        tokens, reset, .knock (knockout button), .icon-btn — home, projects, 404
│   ├── home.css        index.html
│   ├── projects.css    projects.html (cards + award)
│   └── grid.css        the four project pages (from the "Lichtpult" Portfolio v2.css, unused rules removed)
├── js/
│   ├── landing.js      home: reel play/pause, click / keys → projects
│   ├── projects.js     projects: ←/→ between cards, Esc → home, award overlay
│   ├── grid.js         project pages: gap-free tile packing, lightbox, VR galleries, cursor label
│   └── main.js         entry point — runs whichever of the above the page loaded (keep it last)
├── fonts/              Archivo + JetBrains Mono (project pages and CV)
├── img/<section>/      images; every grid thumbnail also has a <name>-960.jpg for srcset
└── video/<section>/    videos: <name>.mp4 (desktop) + <name>-m.mp4 (phones); VR also has .webm
```

Scripts are plain `<script defer>` tags, not ES modules, so pages work when opened from disk.

## Adding content

**Image tile** (automotive / archviz / ai): copy an `li.t` in the page. The thumbnail uses
`src="…/name.jpg" srcset="…/name-960.jpg 960w, …/name.jpg 2200w"`; the lightbox content lives in the tile's `<template>`.

**Image sizes:** export at most 2200 px wide, JPEG ~80 quality, plus a 960 px copy named `<name>-960.jpg`.

**Video:** `<name>.mp4` (H.264, no audio, `-movflags +faststart`) for screens over 900 px and `<name>-m.mp4` (720–1280 px) for phones:

```bash
ffmpeg -i master.mp4 -an -c:v libx264 -preset slow -crf 22 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -movflags +faststart name.mp4
ffmpeg -i master.mp4 -an -vf scale=720:-2 -c:v libx264 -preset slow -crf 24 -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p -movflags +faststart name-m.mp4
```

When you replace a file but keep its name, add `?v=N` to its URL in the HTML so browsers don't show the cached one.

## Keyboard

- **Home:** Enter, arrow keys or space → projects.
- **Projects:** ←/→ move between cards, Enter opens, Esc → home (Esc closes the award overlay first).
- **Project pages:** in the lightbox, ←/→ browse and Esc closes.

## Scripts

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run build`  | SEO tags, German pages, sitemap (run after edits) |
| `npm run og`     | Regenerates the social share images               |
| `npm run dev`    | Serves the site on port 8000                      |
| `npm run format` | Formats every file with Prettier                  |

## Deploy

Vercel deploys `main` on every push (https://github.com/jusceliodiaz/Portfolio).
`deploy.ps1` runs the build, commits, pushes, waits for the live page to change and opens it.
`vercel.json` sets cache headers for images, videos and fonts; `.vercelignore` keeps tools and sources out of the deploy.
