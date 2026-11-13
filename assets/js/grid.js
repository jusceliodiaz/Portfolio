/**
 * Project pages (automotive / archviz / vr-realtime / ai-generative).
 * Tile grid, lightbox, VR galleries and cursor label — adapted from the "Lichtpult" portfolio (v2.js),
 * without the filter bar: each page has one fixed view, set by `data-f` on `.grid`
 * ("auto" | "figur" → equal 16:9-ish tiles, "comfy" → equal squares).
 */
// DOM helpers shared by every function in this file
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Video budget for phones ----------
   iOS has few hardware video decoders and little memory per tab: every video that has played stays
   decoded until the page closes, so a long page stutters and later videos never start (black / poster).
   On touch devices a video that leaves the screen is parked: its <source> URLs are emptied and load()
   frees the decoder; it is restored when it comes back (the file is still in the HTTP cache). */
const LITE = matchMedia('(hover: none) and (pointer: coarse)').matches;

function wake(v) {
  if ('parked' in v.dataset) {
    v.querySelectorAll('source[data-src]').forEach((s) => {
      s.src = s.dataset.src;
      delete s.dataset.src;
    });
    delete v.dataset.parked;
    v.load();
  }
  v.dataset.used = '';
  v.play().catch(() => {});
}

function rest(v) {
  v.pause();
  if (!LITE || 'parked' in v.dataset || !('used' in v.dataset)) return;
  v.querySelectorAll('source[src]').forEach((s) => {
    s.dataset.src = s.getAttribute('src');
    s.removeAttribute('src');
  });
  v.dataset.parked = '';
  v.load();
}

function initGrid() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The bar wraps to two rows on narrow screens; reserve exactly its height so it never covers content.
  const bar = $('.bar');
  const main = $('main');
  const fitBar = () => {
    if (bar && main) main.style.paddingTop = bar.offsetHeight + 'px';
  };
  fitBar();
  addEventListener('resize', fitBar);
  document.fonts?.ready.then(fitBar);

  const grid = $('.grid');
  const tiles = grid ? $$('.t', grid) : [];
  tiles.forEach((t, i) => t.style.setProperty('--i', Math.min(i, 16))); // staggered fade-in
  requestAnimationFrame(() => document.body.classList.remove('is-loading'));

  /* Muted autoplay videos (tiles, VR cards): play only while visible and no overlay is open —
     on phones at most two at once */
  const vids = $$('.grid video[data-autoplay], .vr-card video[data-autoplay]');
  if (!reduce && 'IntersectionObserver' in window) {
    const seen = new Set();
    const sync = () => {
      const on = $('dialog[open]') ? [] : vids.filter((v) => seen.has(v)).slice(0, LITE ? 2 : Infinity);
      vids.forEach((v) => (on.includes(v) ? wake(v) : rest(v)));
    };
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        sync();
      },
      { threshold: 0.2 },
    );
    vids.forEach((v) => io.observe(v));
    const mo = new MutationObserver(sync); // a gallery / lightbox opening or closing
    $$('dialog').forEach((d) => mo.observe(d, { attributes: true, attributeFilter: ['open'] }));
  }

  // Narrow screens scroll the project nav sideways: keep the current page in view.
  const nav = $('.bar-filter');
  const current = nav?.querySelector('[aria-current]');
  const centreCurrent = () => {
    if (current) nav.scrollLeft = current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2;
  };
  centreCurrent();
  document.fonts?.ready.then(centreCurrent);

  // Second gallery (archviz "Lifestyle scenes"): plain flow, shares the lightbox after the main grid
  const free = $$('.grid-free .t');
  free.forEach((t, i) => (t.dataset.pos = 1000 + i));
  if (grid) initTiles(grid, tiles, free);
  initGalleries(reduce);
  initFilms();
  initCursor();
}

/* ---------- Gap-free grid: dense placement, then stretch neighbours into holes ---------- */
function initTiles(grid, tiles, free = []) {
  const span = (t, cols) => {
    const f = grid.dataset.f;
    if (f === 'figur' || f === 'auto') return cols >= 12 ? [4, 3] : [3, 2];
    if (f === 'comfy') return cols >= 12 ? [4, 4] : cols >= 6 ? [2, 2] : [3, 3];
    const cs = getComputedStyle(t);
    const k = cols >= 12 ? ['--w', '--h'] : cols >= 6 ? ['--tw', '--th'] : ['--mw', '--mh'];
    return [
      Math.min(cols, parseInt(cs.getPropertyValue(k[0])) || 1),
      parseInt(cs.getPropertyValue(k[1])) || 1,
    ];
  };

  function pack(items, cols) {
    const occ = [];
    const free = (r, c, w, h) => {
      if (c < 0 || c + w > cols || r < 0) return false;
      for (let y = r; y < r + h; y++)
        for (let x = c; x < c + w; x++) if (occ[y]?.[x] !== undefined) return false;
      return true;
    };
    const mark = (r, c, w, h, i) => {
      for (let y = r; y < r + h; y++) {
        occ[y] ||= [];
        for (let x = c; x < c + w; x++) occ[y][x] = i;
      }
    };
    const pos = items.map((t, i) => {
      const [w, h] = span(t, cols);
      for (let r = 0; ; r++)
        for (let c = 0; c < cols; c++)
          if (free(r, c, w, h)) {
            mark(r, c, w, h, i);
            return { r, c, w, h };
          }
    });
    const rows = Math.max(...pos.map((p) => p.r + p.h));
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          if (occ[r]?.[c] !== undefined) continue;
          const tries = [
            [
              occ[r]?.[c - 1],
              (p) => p.c + p.w === c && free(p.r, c, 1, p.h),
              (p, i) => {
                mark(p.r, c, 1, p.h, i);
                p.w++;
              },
            ],
            [
              occ[r - 1]?.[c],
              (p) => p.r + p.h === r && free(r, p.c, p.w, 1),
              (p, i) => {
                mark(r, p.c, p.w, 1, i);
                p.h++;
              },
            ],
            [
              occ[r]?.[c + 1],
              (p) => p.c - 1 === c && free(p.r, c, 1, p.h),
              (p, i) => {
                mark(p.r, c, 1, p.h, i);
                p.c--;
                p.w++;
              },
            ],
            [
              occ[r + 1]?.[c],
              (p) => p.r - 1 === r && free(r, p.c, p.w, 1),
              (p, i) => {
                mark(r, p.c, p.w, 1, i);
                p.r--;
                p.h++;
              },
            ],
          ];
          for (const [i, ok, grow] of tries) {
            if (i === undefined) continue;
            if (ok(pos[i])) {
              grow(pos[i], i);
              changed = true;
              break;
            }
          }
        }
    }
    let holes = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (occ[r]?.[c] === undefined) holes++;
    return { pos, holes };
  }

  function layout() {
    if (!tiles.length) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 12;
    let items = [...tiles];
    // AI Generative: architecture and characters alternate one by one
    if (grid.dataset.f === 'comfy') {
      const arch = items.filter((t) => t.dataset.mix === 'arch');
      const rest = items.filter((t) => t.dataset.mix !== 'arch');
      items = [];
      while (arch.length || rest.length) {
        if (arch.length) items.push(arch.shift());
        if (rest.length) items.push(rest.shift());
      }
    }
    let best = pack(items, cols);
    let bestItems = items;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const fixed = Math.min(6, items.length);
    for (let k = 0; best.holes && k < 600; k++) {
      const tail = items.slice(fixed);
      for (let i = tail.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [tail[i], tail[j]] = [tail[j], tail[i]];
      }
      const alt = [...items.slice(0, fixed), ...tail];
      const res = pack(alt, cols);
      if (res.holes < best.holes) {
        best = res;
        bestItems = alt;
      }
    }
    bestItems.forEach((t, i) => {
      const p = best.pos[i];
      t.dataset.pos = i;
      t.style.gridColumn = `${p.c + 1} / span ${p.w}`;
      t.style.gridRow = `${p.r + 1} / span ${p.h}`;
    });
  }

  layout();
  let lastCols = 0;
  if ('ResizeObserver' in window)
    new ResizeObserver(() => {
      const c = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      if (c !== lastCols) {
        lastCols = c;
        layout();
      }
    }).observe(grid);
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(layout, 120);
  });

  /* "More" badge: expand icon + number of extra images in the lightbox */
  const EXPAND =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
  [...tiles, ...free]
    .filter((t) => t.querySelector('template'))
    .forEach((t) => {
      const n = t.querySelector('template').content.querySelectorAll('.lb-row figure').length;
      const more = document.createElement('span');
      more.className = 't-more';
      more.setAttribute('aria-hidden', 'true');
      more.innerHTML = EXPAND + (n > 1 ? `<b>+${n - 1}</b>` : '');
      $('.t-open', t).append(more);
    });

  /* Lightbox with prev/next, in visual order */
  const lb = $('dialog.lb');
  if (!lb) return;
  let cur = 0;
  const mediaTiles = [...tiles, ...free].filter((t) => t.querySelector('template'));
  const visible = () => [...mediaTiles].sort((x, y) => x.dataset.pos - y.dataset.pos);
  const show = (idx) => {
    const list = visible();
    cur = (idx + list.length) % list.length;
    const frag = $('template', list[cur]).content.cloneNode(true);
    $('.lb-body', lb).replaceChildren(frag.querySelector('.lb-row'));
    const info = frag.querySelector('.lb-info');
    $('.lb-meta', lb).replaceChildren(...(info ? info.childNodes : []));
    $('.lb-count', lb).textContent =
      `${String(cur + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
  };
  mediaTiles.forEach((t) =>
    $('.t-open', t).addEventListener('click', () => {
      show(visible().indexOf(t));
      lb.showModal();
    }),
  );
  $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
  $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => $('.lb-body', lb).replaceChildren());
  document.addEventListener('keydown', (e) => {
    if (!lb.open) return;
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    sx = null;
  });
}

/* ---------- VR card galleries: dimmed page, videos play only while open and visible ---------- */
function initGalleries(reduce) {
  $$('dialog.gal').forEach((d) => {
    const vids = $$('video', d);
    // Posters live in data-poster (+ a 960px data-poster-m for phones), so a closed gallery downloads nothing.
    const narrow = matchMedia('(max-width: 900px)').matches;
    const posters = () =>
      vids.forEach((v) => {
        const src = (narrow && v.dataset.posterM) || v.dataset.poster;
        if (src && !v.getAttribute('poster')) v.poster = src;
      });
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && d.open && !reduce) wake(e.target);
          else rest(e.target);
        }),
      { root: d, threshold: 0.35 },
    );
    vids.forEach((v) => io.observe(v));
    d.querySelector('.gal-close')?.addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
    d.addEventListener('gal-open', posters);
    d.addEventListener('close', () => vids.forEach(rest));
  });
  $$('[data-open-gal]').forEach((b) =>
    b.addEventListener('click', () => {
      const d = document.getElementById(b.dataset.openGal);
      if (!d) return;
      d.dispatchEvent(new Event('gal-open'));
      d.showModal();
      d.focus();
      d.scrollTop = 0;
    }),
  );
}

/* ---------- Cursor label ("Open") over tiles ---------- */
function initCursor() {
  const cur = document.querySelector('.cursor');
  if (!cur || !matchMedia('(hover: hover)').matches) return;
  const label = cur.textContent.trim();
  document.documentElement.classList.add('has-cursor');
  document.addEventListener('pointermove', (e) => {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('.grid .t-open, .grid-free .t-open').forEach((b) => {
    b.addEventListener('pointerenter', () => {
      cur.textContent = label; // text comes from the HTML, so it follows the page language
      cur.classList.add('on');
    });
    b.addEventListener('pointerleave', () => cur.classList.remove('on'));
  });
}

/* ---------- Film cards (VR page showreel): the poster is a button; the player loads only on click ---------- */
function initFilms() {
  const play = (btn) => {
    const iframe = document.createElement('iframe');
    iframe.className = 'film-frame';
    iframe.src = btn.dataset.embed;
    iframe.title = btn.getAttribute('aria-label').replace(/^Play /, '');
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    btn.replaceWith(iframe);
  };
  $$('.film-embed[data-embed]').forEach((btn) => btn.addEventListener('click', () => play(btn)));
  // 'Play film' text buttons point at a poster button by id
  $$('[data-play]').forEach((link) =>
    link.addEventListener('click', () => {
      const btn = document.getElementById(link.dataset.play);
      if (btn) play(btn);
    }),
  );
}
