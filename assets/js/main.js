/**
 * Entry point, loaded last with `defer`, so the DOM is ready here.
 * index.html → landing.js · projects.html → projects.js · project pages → grid.js.
 * Plain scripts (not ES modules) so every page also works when opened directly from disk.
 */
if (typeof initLanding === 'function') initLanding();
if (typeof initProjects === 'function') initProjects();
if (typeof initGrid === 'function') initGrid();
