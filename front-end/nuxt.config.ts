export default defineNuxtConfig({
  devtools: { enabled: false },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  ssr: false,
  modules: ["@nuxt/image", "nuxt-icon", "@pinia/nuxt"],
  css: ["~/assets/main.css"],
  app: {
    head: {
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
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.API_URL || "https://mma-app-api.mmabaisieux.fr",
      frontVersion: "1.6",
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
