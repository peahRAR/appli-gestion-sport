export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    baseURL: '/', // Base URL de l'application (la racine)
    buildAssetsDir: '/_nuxt/', // Dossier des assets de build
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
});
