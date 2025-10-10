<template>
  <div>
    <CardsList v-if="isAuthenticated" />
    <TheAuth v-else />

    <!-- Modale règlement -->
    <RulesApprovalModal
      v-if="isAuthenticated"
      :isOpen="showRulesModal"
      :baseUrl="getUrl()"
      :userId="userId"
      @approved="onRulesApproved"
    />
  </div>
</template>

<script>
import RulesApprovalModal from '@/components/RulesApprovalModal.vue'

export default {
  components: { RulesApprovalModal },
  data() {
    return {
      isAuthenticated: null,
      showRulesModal: false,
      userId: null,
    }
  },
  async mounted() {
    await this.checkAuthenticationAndRules();
  },
  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      return config.public.siteUrl;
    },
    getToken() {
      return localStorage.getItem('accessToken');
    },
    getUserIdFromToken() {
      const token = this.getToken();
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload?.sub || null;
      } catch {
        return null;
      }
    },

    async checkAuthenticationAndRules() {
      // 1) auth
      const token = this.getToken();
      if (!token) {
        this.isAuthenticated = false;
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        if (exp < new Date()) {
          localStorage.removeItem('accessToken');
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = true;
        this.userId = this.getUserIdFromToken();
      } catch {
        this.isAuthenticated = false;
        return;
      }

      // 2) check approove_rules
      try {
        const res = await fetch(`${this.getUrl()}/users/${this.userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
        if (!res.ok) {
          // si l’appel échoue, ne bloque pas l’app
          this.showRulesModal = false;
          return;
        }
        const user = await res.json();

        // IMPORTANT : assure-toi que le back renvoie bien le champ !
        // -> 'approove_rules' doit être dans le select de findOne()
        this.showRulesModal = user?.approove_rules !== true;
      } catch (e) {
        console.error('check approove_rules error:', e);
        this.showRulesModal = false; // à toi de décider si tu veux bloquer en cas d’erreur réseau
      }
    },

    onRulesApproved() {
      // callback depuis la modale (PATCH ok)
      this.showRulesModal = false;
    },
  }
}
</script>
