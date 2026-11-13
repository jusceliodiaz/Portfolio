/**
 * Projects (projects.html): four project cards + the award overlay.
 * ←/→ move focus between cards, Enter opens the focused one, Esc goes home.
 */
const HOME_URL = 'index.html';

function initProjects() {
  const cards = [...document.querySelectorAll('.card-link')];
  if (!cards.length) return;

  // Cover videos autoplay muted; "reduce motion" keeps the poster, and they pause while the tab is hidden.
  const videos = [...document.querySelectorAll('.card-media')].filter((el) => el.tagName === 'VIDEO');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce)
    videos.forEach((v) => {
      v.removeAttribute('autoplay');
      v.pause();
    });
  document.addEventListener('visibilitychange', () =>
    videos.forEach((v) => (document.hidden || reduce ? v.pause() : v.play().catch(() => {}))),
  );

  initAward();

  window.addEventListener('keydown', (event) => {
    if (document.querySelector('dialog[open]')) return; // keys belong to the open overlay
    if (event.key === 'Escape') {
      location.href = HOME_URL;
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const at = cards.indexOf(document.activeElement);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = at === -1 ? (step === 1 ? 0 : cards.length - 1) : (at + step + cards.length) % cards.length;
    cards[next].focus();
  });
}

/* Award overlay: the floating card opens #award; the film loads only on "play" and is removed on close. */
function initAward() {
  const card = document.querySelector('.award-card');
  const dialog = document.querySelector('#award');
  if (!card || !dialog) return;
  const media = dialog.querySelector('.award-media');
  const playBtn = dialog.querySelector('.award-play');

  card.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.award-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close(); // click on the backdrop
  });

  playBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${playBtn.dataset.youtube}?autoplay=1&rel=0`;
    iframe.title = 'Casa Müze project film';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    playBtn.replaceWith(iframe);
  });

  dialog.addEventListener('close', () => {
    const iframe = media.querySelector('iframe');
    if (iframe) iframe.replaceWith(playBtn); // stops the film
    card.focus();
  });
}
