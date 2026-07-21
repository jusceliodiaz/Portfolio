# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio for Juscélio Diaz — Senior Tech Artist & Junior Developer. Single-page site in pure HTML/CSS/JS with no build step, no package manager, and no framework.

## Running the site

Open `index.html` directly in a browser. There is no dev server, no npm, no compilation step. All assets are local or loaded via CDN (Google Fonts).

## Architecture

Everything lives in a single file: `index.html`. CSS is inlined in `<style>`, JavaScript is inlined in two `<script>` blocks at the bottom of `<body>`.

**Sections (in order):** Hero → Projects → Gallery → Showreel → Contact → Footer

**Images:**
- `images/me.jpg` — profile photo
- `images/hero/h1–h7.jpg` — hero background slideshow
- `images/portfolio/2–32.jpg` — gallery grid
- `images/5a.jpg`, `images/ue1.jpg` — project card thumbnails

## Key patterns

**Design tokens** — all colors, spacing, and layout values are CSS custom properties on `:root` (e.g. `--bg`, `--accent`, `--card`, `--maxw`). Change visual style by editing variables there, not inline.

**Bilingual content (EN/NL)** — translatable elements carry `data-en="..."` and `data-nl="..."` attributes. The `applyLang(lang)` function in the first `<script>` block sets `el.textContent` from the matching attribute and persists the choice to `localStorage` under the key `cv-lang`. To add a new translatable string, add both `data-en` and `data-nl` to the element.

**Scroll reveal** — elements with class `reveal` start invisible (`opacity:0; transform:translateY(30px)`). An `IntersectionObserver` adds class `in` when they enter the viewport. Stagger delay is computed as `(index % 4) * 0.08s`.

**Hero slideshow** — `.hero-slide` elements cycle via `setInterval` (5 s) by toggling class `active`, which triggers a CSS `opacity` + `scale` transition.

**Fallback images** — every `<img>` has an `onerror` handler that hides the broken image and shows a sibling `.fallback` div with initials/title text.
