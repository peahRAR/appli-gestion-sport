export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    baseURL: process.env.CI ? "/frontend-app-mma" : "/",  // Base URL de l'application
    buildAssetsDir: process.env.CI ? "/frontend-app-mma/_nuxt/" : "/_nuxt/",  // Dossier des assets de build
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
      frontVersion: "Bêta",
      backVersion: "1.0",
    },
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/terms',
        '/admin',
        '/reset-password',
        // Ajouter d'autres routes nécessaires
      ],
    },
  },
});
