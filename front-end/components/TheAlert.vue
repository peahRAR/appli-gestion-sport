<template>
  <div class="alert-container bg-orange-200 p-4" v-if="showAlerts">
    <div class="alert-header flex items-center cursor-pointer" @click="toggleExpand">
      <div class="flex items-center">
        <div
          class="exclamation-mark-container flex items-center justify-center rounded-full bg-orange-500 text-white text-xl w-10 h-10 mr-2">
          <Icon class="-rotate-12 text-2xl" name="fluent-emoji-high-contrast:loudspeaker" />
        </div>
        <h3 class="text-lg font-bold">Informations ({{ alerts.length }})</h3> <!-- Ajout du nombre d'alertes -->
      </div>
      <button class="expand-button ml-auto text-blue-500" @click="expanded = !expanded">
        {{ expanded ? 'Replier' : 'Déplier' }}
      </button>
    </div>
    <transition name="fade">
      <div class="alert-content mt-2" v-show="expanded">
        <div class="alert bg-orange-300 rounded-md shadow-md p-3 mb-2" v-for="(alert, index) in alerts" :key="index">
          <div class="alert-details">
            <h4 class="text-lg font-semibold mb-1">{{ alert.titre }}</h4>
            <p class="text-black-700 [&_a]:text-blue-600 [&_a]:underline" v-html="linkify(alert.contenu)"></p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      expanded: true,
    };
  },
  props: {
    alerts: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    showAlerts() {
      return this.alerts.length > 0;
    },
  },
  methods: {
    toggleExpand() {
      if (this.alerts.length > 20) {
        this.expanded = !this.expanded;
      }
    },
    linkify(text) {
      if (!text) return "";

      // 1) échappe le HTML pour éviter l’injection (sécurité)
      const escaped = String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // 2) remplace les URLs par des <a>
      const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/g;

      return escaped.replace(urlRegex, (match) => {
        const href = match.startsWith("http") ? match : `https://${match}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      });
    }
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.exclamation-mark {
  margin-top: 2px;
  /* Ajuster la marge pour centrer verticalement */
}
</style>
