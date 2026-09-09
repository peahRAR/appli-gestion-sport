import { releases } from "./data/releases";

const latestVersion = [...releases].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)[0]?.version ?? "0.0.0";

export default defineNuxtConfig({
  // Keep the Nuxt 3 file layout (no app/ directory) — see the migration plan
  // for why: pure risk with no functional benefit given the size of this repo
  // and the amount of other work landing in the same branch.
  srcDir: '.',
  devtools: { enabled: false },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  ssr: false,
  modules: ["@nuxt/image", "@nuxt/icon", "@pinia/nuxt", "@vite-pwa/nuxt"],
  css: ["~/assets/main.css"],
  pwa: {
    registerType: "prompt",
    // injectManifest (not generateSW) because Lot 7 needs a custom `push` /
    // `notificationclick` handler in the same worker.
    strategies: "injectManifest",
    srcDir: "service-worker",
    filename: "sw.ts",
    // The manifest already exists and is linked below — don't generate/inject a second one.
    manifest: false,
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
      // 200.html/404.html are Nuxt's static-hosting SPA fallback files, served
      // by the CDN for unmatched routes — they aren't real URLs on the site
      // (GET /200 and GET /404 both 404). Precaching them anyway made Workbox
      // fail the whole install step on a bad response, silently discarding
      // the entire service worker registration on every load.
      globIgnores: ["200.html", "404.html"],
    },
    devOptions: {
      enabled: false,
    },
    client: {
      installPrompt: true,
    },
  },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
        { rel: "manifest", href: "/manifest.webmanifest" },
      ],
      meta: [
        { name: "theme-color", content: "#000000" },
      ],
      script: [
        {
          // Applies the persisted/system theme before the app mounts, to avoid a flash of the wrong theme (FOUC).
          innerHTML: `(function(){try{var s=localStorage.getItem('theme-preference');var m=(s==='light'||s==='dark')?s:'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
        },
      ],
    },
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.API_URL || "https://mma-app-api.mmabaisieux.fr",
      frontVersion: latestVersion,
      // Baked in at build time (nuxt generate) since this is a static SPA —
      // VAPID_PUBLIC_KEY is not secret (it's shipped to every browser
      // anyway), see .github/workflows/deploy-front.yaml for the CI value.
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
    },
  },
});
