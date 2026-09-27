# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio for Juscélio Diaz — real-time architectural visualisation, aimed at high-end archviz studios. Pure HTML/CSS/JS with no build step, no package manager, and no framework.

## Running the site

Open `index.html` directly in a browser. There is no dev server, no npm, no compilation step. All assets are local or loaded via CDN (Google Fonts).

## Pages

- `index.html` — the live portfolio (monograph layout). CSS inlined in `<style>`, one `<script>` at the end of `<body>`.
- `cv-alt.html` — the CV linked from `index.html`; A4 print layout, "Download PDF" calls `window.print()`.
- `index-old.html`, `cv.html` — previous design, kept for reference (`index-old.html` is `noindex`).

**Sections of `index.html` (in order):** Hero → Practice → Selected work index → Projects 01–06 → Film → Tools & assets → Automotive → Profile → Contact

## Key patterns

**Design tokens** — colors, fonts, margin (`--m`) and gutter (`--g`) are CSS custom properties on `:root`. Change visual style there, not inline.

**Layout** — a 12-column `.grid`. Plates use span classes: `.c-full`, `.c-half`, `.c-third`, `.c-wide` + `.c-side`, `.c-right`, `.c-mid`, `.c-tall` + `.c-copy`. All collapse to full width under 900px.

**Projects** — each is an `<article class="project" id="p-NN">` with a `.p-head` (number, title, `dl.p-meta`) and a `.plates` grid of `<figure class="plate">`. Add a project by copying one article and adding a matching row to `#indexList` (its `data-peek` is the hover-preview image).

**Language** — English-only. Write copy directly as element text; there is no i18n layer.

**Scroll reveal** — elements with class `rv` fade/slide in when an `IntersectionObserver` adds class `in`.

**Hero** — `.hero-slide` elements cross-fade every 6 s by toggling class `on`; each carries `data-cap` and `data-href` for the caption link.

**Pass wipe** — `.wipe` stacks the final render under a `.pass` image clipped by `--x`, driven by a transparent `<input type="range">`. Buttons with `data-src` in the following `.wipe-ctrl` swap the pass.

**Lightbox** — any `.plate > img` opens it; `data-full` overrides the source (used when the thumbnail is a mobile variant).

**Images** — `images/mobile/*` are 900px variants used in `srcset`. `images/mobile/2.jpg` is NOT the same picture as `images/2.jpg`, so don't use it.
