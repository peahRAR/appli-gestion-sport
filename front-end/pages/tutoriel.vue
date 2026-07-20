<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div v-else-if="error" class="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center text-center">
      <div>
        <p class="text-text font-semibold mb-2">Le tutoriel n'a pas pu être chargé.</p>
        <p class="text-text-muted text-sm">Réessayez dans quelques instants.</p>
      </div>
    </div>
    <div v-else class="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6.5rem)]">
      <iframe
        :src="embedUrl"
        title="Tutoriel MMA — grades"
        class="w-full h-full border-0 block"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      error: false,
    };
  },
  computed: {
    embedUrl() {
      return `${this.getUrl()}/embed/mma/`;
    },
  },
  async mounted() {
    this.checkAccessToken();
    await this.createEmbedSession();
  },
  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      return config.public.siteUrl;
    },
    checkAccessToken() {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        document.location.href = "/";
        return;
      }
      const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
      const expirationDate = new Date(decodedToken.exp * 1000);
      if (expirationDate < new Date()) {
        localStorage.removeItem("accessToken");
        document.location.href = "/";
      }
    },
    async createEmbedSession() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();
        // credentials: "include" est indispensable : le cookie de session
        // embed est posé par l'API (domaine distinct du front en prod) et ne
        // sera ni envoyé ni accepté sans lui, même si l'appel réussit.
        const response = await fetch(`${url}/embed/mma/session`, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Échec de la création de session: ${response.status}`);
        }
        this.loading = false;
      } catch (error) {
        console.error("Erreur lors de la création de la session du tutoriel", error);
        this.error = true;
        this.loading = false;
      }
    },
  },
};
</script>
