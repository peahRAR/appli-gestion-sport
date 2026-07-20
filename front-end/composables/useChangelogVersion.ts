const LAST_SEEN_KEY = "lastSeenVersion";

const hasNewVersion = ref(false);
let initialized = false;

function currentVersion(): string {
  return useRuntimeConfig().public.frontVersion;
}

function checkForNewVersion() {
  if (typeof window === "undefined") return;
  const seen = window.localStorage.getItem(LAST_SEEN_KEY);
  const current = currentVersion();

  if (seen === null) {
    // First visit on this browser: nothing to catch up on, don't show a badge.
    window.localStorage.setItem(LAST_SEEN_KEY, current);
    hasNewVersion.value = false;
    return;
  }

  hasNewVersion.value = seen !== current;
}

function markVersionSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, currentVersion());
  hasNewVersion.value = false;
}

export function useChangelogVersion() {
  if (!initialized) {
    initialized = true;
    checkForNewVersion();
  }
  return { hasNewVersion, markVersionSeen };
}
