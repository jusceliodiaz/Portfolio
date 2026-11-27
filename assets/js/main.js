/**
 * Entry point, loaded last with `defer`, so the DOM is ready here.
 * Every page (home, real-time, stills, automotive, AI) runs grid.js.
 * Plain scripts (not ES modules) so every page also works when opened directly from disk.
 */
if (typeof initGrid === 'function') initGrid();
