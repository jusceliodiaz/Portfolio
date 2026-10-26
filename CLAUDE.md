# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio for Juscélio Diaz — real-time architectural visualisation, aimed at high-end archviz studios. Pure HTML/CSS/JS with no build step, no package manager, and no framework.

## Running the site

Open `index.html` directly in a browser. There is no dev server, no npm, no compilation step. All assets are local or loaded via CDN (Google Fonts). `deploy.ps1` commits, pushes to `main` (Vercel deploys on push) and waits for the live page to change.

## Pages

- `index.html` — the live portfolio, "Lichtpult" tile-grid design (adapted from the aicontent site). Style in `v2/v2.css`, behaviour in `v2/v2.js`, fonts in `assets/fonts/`, images only from `images_v2/`, auto-reload via `autoreload_v2.js`.
- `index_old.html` — the previous live portfolio (monograph layout), `noindex`, kept for reference. Uses `images/` and `autoreload.js`. The monograph patterns below apply to it.
- `cv.html` — the CV linked from `index.html`; uses the monograph tokens and grid, with an A4 `@media print` layout ("Download PDF" calls `window.print()`). Its nav links into `index.html` filters (`#figur`, `#auto`, `#video`).
- `cv-alt.html` — an A4 print-layout CV made for the monograph redesign; not linked, kept for reference.
- `index-old.html` — an even older design, kept for reference (`noindex`). Unrelated to `index-v2.html` / root `v2.css` / `v2.js` (old experiment).
- `perfmon_sample_report.html` — sample report linked from the ComfyUI write-up.

## index.html (Lichtpult)

**Structure** — fixed `.bar` (name, filter buttons, Info, EN/ES) → `#hero` video → `ul#grid` of tiles → `#comfyPipe` (ComfyUI write-up) → `#pipe` (Profile) → footer, plus `dialog.lb` (lightbox) and `dialog.info` (info panel).

**Tiles** — each is an `li.t` with `data-cat` (the filter it belongs to), spans `--w/--h` (12 cols), `--tw/--th` (6 cols, ≤1100px), `--mw/--mh` (3 cols, ≤640px), a `button.t-open` with the thumbnail, `.t-badge` (`data-s` = short label for tiny tiles) and `.t-cap`, and a `<template>` holding the lightbox row (`.lb-row` of figures — final + passes, video, or an iframe) and `.lb-info`. Tiles with `data-only="1" hidden` appear only under their filter. `v2.js` adds a `.t-more` badge (expand icon + "+N" extra lightbox figures) to every tile that has a `<template>`. `v2.js` packs tiles gap-free (reorders after the first six and stretches neighbours), so DOM order isn't visual order.

**Filters** — `data-filter` values: `""` All, `figur` Archviz (projects 01–06), `auto` Automotive (07), `video` Film (hides the grid, shows the write-up `#filmPipe`: text box + film per row; `.film-embed` buttons load the YouTube/Vimeo/mp4 only on click and `v2.js` swaps them back on filter change), `inter` VR/XR/Real-time (button label; hides the grid, shows the write-up `#interPipe`; the tool/web-project tiles T.01–T.06 (Scene Validator, Beach House, ArchViz Configurator, Exterior interactive e-shop, First Person interactive showroom, Living Configurator) use `data-cat="tool"`, so they show under All only; each also has a card in `#interPipe` (`.vr-grid`: two `.vr-card`s per row, text on a gradient over the image; on phones the text sits under a full 16:9 image)), `comfy` AI Generative (button label; all tiles square and equal: 3 per row, 1 on phones; write-up `#comfyPipe`); a write-up block with `data-pipe-for="<filter>"` shows under the grid only for that filter, `pipeline` Profile (button is `hidden` in the bar; reachable only via the `#pipeline` URL hash; hides the grid, shows `#pipe`). A URL hash with a filter name opens it; `data-go-filter` links (hero `.hero-tags`, info panel) do the same. `sheet` (passes-only view) still exists in the JS/CSS but has no button or tiles.

**Language** — EN default, ES via the bar toggle: every translatable text is `<span data-es="…" data-en="…">` with the English text as content.

**ComfyUI content** — imported from the aicontent site; media in `media_ai/` (avif/webp/jpg, `-thumb`/`-m` sizes), tile numbers prefixed `C.`.

**Hero** — shown only under "All" (any other filter hides it and pauses the video; "All" scrolls back to the top). Looping, muted `#heroVideo` (`images_v2/hero2_web.mp4`, `hero2.jpg` poster), started by `v2.js` unless `prefers-reduced-motion`; only the kicker line and the filter tags sit over it. `hero2_web.mp4` is encoded from the source `images/hero_web.webm` (no audio, x264 slow CRF 19, maxrate 12M, faststart); don't reference the source from the page.

## index_old.html (monograph)

**Sections (in order):** Hero → Practice → Selected work index → Projects 01–06 → Project 07 (Automotive) → Reel → Tools & assets → Profile → Contact

**Nav** — top links follow page order; each `a[data-for]` lists the section ids that highlight it (`aria-current`) while in view. Under 900px the nav becomes a dropdown behind the `.menu-btn` toggle. "Archviz" and "Interactive" are `.nav-drop` mega-menus: a list + preview plate from each row's `data-peek`.

**Design tokens** — colors, fonts, margin (`--m`) and gutter (`--g`) are CSS custom properties on `:root`.

**Layout** — a 12-column `.grid`. Plates use span classes: `.c-full`, `.c-half`, `.c-third`, `.c-wide` + `.c-side`, `.c-right`, `.c-mid`, `.c-tall` + `.c-copy`. All collapse to full width under 900px.

**Projects** — each is an `<article class="project" id="p-NN">` with a `.p-head` and a `.plates` grid of `<figure class="plate">`, plus a row in `#indexList`.

**Pass wipe / pass cycle / lightbox** — `.wipe` compares a `.pass` image clipped by `--x`; `.plate[data-passes]` steps through passes on hover; any `.plate > img` opens the lightbox (`data-full` overrides the source).

## Images

`images/` is the full set used by `index_old.html` and `cv.html`; `images_v2/` holds copies of only what `index.html` uses (some removed from the new page were deleted there). `*/mobile/*` are 900px variants used in `srcset`. `images/mobile/2.jpg` is NOT the same picture as `images/2.jpg`, so don't use it.
