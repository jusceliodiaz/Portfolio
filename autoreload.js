// Reload an open page when a new deploy goes live.
// Every 20 s (and when the tab regains focus) it asks the server for the
// page's ETag without cache; when that changes, the page reloads and returns
// to the same scroll position. It waits while a video player or the
// lightbox is open so nobody is interrupted mid-view.
(() => {
  if (location.protocol === "file:") return;
  const KEY = "reload-scroll:" + location.pathname;
  let tag = null;

  try {
    const y = sessionStorage.getItem(KEY);
    if (y !== null) {
      sessionStorage.removeItem(KEY);
      addEventListener("load", () => scrollTo({ top: +y, behavior: "instant" }));
    }
  } catch (e) {}

  const busy = () =>
    document.querySelector(".player iframe") ||
    (document.getElementById("lb") && !document.getElementById("lb").hidden);

  async function check() {
    try {
      const r = await fetch(location.pathname + "?v=" + Date.now(), { method: "HEAD", cache: "no-store" });
      const now = r.headers.get("etag") || r.headers.get("last-modified");
      if (!now) return;
      if (tag === null) { tag = now; return; }
      if (now !== tag && !busy()) {
        try { sessionStorage.setItem(KEY, String(scrollY)); } catch (e) {}
        location.reload();
      }
    } catch (e) {}
  }

  check();
  setInterval(check, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
})();
