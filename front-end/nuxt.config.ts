export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    baseURL: process.env.CI ? "/storage.googleapis.com/frontend-app-mma/" : "/",
  },
  ssr: false,
  modules: ["@nuxt/image", "nuxt-icon", "@pinia/nuxt"],
  css: ["~/assets/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.API_URL,
      resetKey: process.env.REINITIALIZATIONKEY,
      frontVersion: process.env.FRONTEND_VERSION,
      backVersion: process.env.BACKEND_VERSION,
    },
  },
});
