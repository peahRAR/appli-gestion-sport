export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

const mode = ref<ThemeMode>("system");
const isDark = ref(false);
let mediaQuery: MediaQueryList | null = null;
let initialized = false;

function resolveIsDark(currentMode: ThemeMode): boolean {
  if (currentMode === "dark") return true;
  if (currentMode === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(currentMode: ThemeMode) {
  isDark.value = resolveIsDark(currentMode);
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark.value);
}

function initTheme() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  mode.value = stored === "light" || stored === "dark" ? stored : "system";
  applyTheme(mode.value);

  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    if (mode.value === "system") applyTheme("system");
  });
}

export function useTheme() {
  initTheme();

  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, newMode);
    }
    applyTheme(newMode);
  }

  return { mode, isDark, setMode };
}
