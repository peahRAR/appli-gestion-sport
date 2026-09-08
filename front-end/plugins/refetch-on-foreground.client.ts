// iOS standalone PWA fix: when the app is backgrounded and comes back, iOS
// freezes the page instead of reloading it (bfcache-like), so mounted
// components never re-fetch on their own and keep showing stale data until
// the user manually navigates away and back. This plugin re-broadcasts a
// generic "app:refresh" window event on the two reliable "we're back"
// signals, so any already-mounted page can just listen and re-run its own
// existing load method.
export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") return;

  function notify() {
    window.dispatchEvent(new CustomEvent("app:refresh"));
  }

  // event.persisted is true when the page is restored from the bfcache —
  // the actual signal fired on iOS when returning to a backgrounded standalone app.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) notify();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") notify();
  });
});
