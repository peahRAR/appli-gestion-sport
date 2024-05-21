export default defineNuxtConfig({
  devtools: { enabled: false },

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
      frontVersion: " Bêta",
      backVersion: "1.0",
    },
  },

  nitro: {
    prerender: {
      routes: [
        '/_ipx/w_320&f_webp/MMABsxLogo.png',
        '/_ipx/w_640&f_webp/MMABsxLogo.png',
        '/_ipx/w_768&f_webp/MMABsxLogo.png',
        '/_ipx/w_1024&f_webp/MMABsxLogo.png',
        '/_ipx/w_1280&f_webp/MMABsxLogo.png',
        '/_ipx/w_1536&f_webp/MMABsxLogo.png',
        '/_ipx/w_2048&f_webp/MMABsxLogo.png',
        '/_ipx/w_2560&f_webp/MMABsxLogo.png',
        '/_ipx/w_3072&f_webp/MMABsxLogo.png',
      ]
    }
  }

});
