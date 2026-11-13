/**
 * Home (index.html): full-screen reel.
 * "enter", a click anywhere on the reel, or an arrow key / space opens projects.html.
 */
const PROJECTS_URL = 'projects.html';
const ENTER_KEYS = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' '];

function initLanding() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const video = hero.querySelector('.hero-video');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // "Reduce motion" keeps the poster frame; the reel also pauses while the tab is hidden.
  if (video) {
    if (reduce) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    const sync = () => (document.hidden || reduce ? video.pause() : video.play().catch(() => {}));
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync); // resumes after "back" from projects.html
  }

  // The whole reel is clickable; the real link (.hero-enter) handles keyboard and screen readers.
  hero.addEventListener('click', (event) => {
    if (!event.target.closest('a')) location.href = PROJECTS_URL;
  });

  window.addEventListener('keydown', (event) => {
    if (!ENTER_KEYS.includes(event.key) || event.target.closest('a, button')) return;
    event.preventDefault();
    location.href = PROJECTS_URL;
  });
}
