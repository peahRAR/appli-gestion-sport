<template>
  <div>
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-white">Licences</h3>
      <span v-if="federationsLoading" class="text-xs text-white/80">Chargement…</span>
    </div>

    <p v-if="loadError" class="mt-2 text-sm text-red-300">{{ loadError }}</p>

    <div v-if="!federationsLoading" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="fed in federationsForDisplay"
        :key="fed.id"
        class="rounded-xl border border-white/40 bg-white/10 p-3"
      >
        <div class="text-xs font-semibold text-white/80 uppercase tracking-wide">
          {{ fed.code }}
        </div>
        <input
          v-model="licenseMap[fed.code].number"
          @input="markTouched(fed.code)"
          type="text"
          placeholder="Non renseigné"
          class="mt-1 w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-hidden focus:ring-2 focus:ring-white/60"
        />
      </div>
    </div>

    <p v-if="saveError" class="mt-2 text-sm text-red-300">{{ saveError }}</p>

    <button
      @click="save"
      :disabled="saving || federationsLoading"
      class="mt-3 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm"
    >
      {{ saving ? 'Enregistrement…' : 'Enregistrer les licences' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LicenseEditor',
  props: {
    userId: { type: String, required: true },
    baseUrl: { type: String, required: true },
    // [{ id, number_plain, federation: { code, name } }]
    licenses: { type: Array, default: () => [] },
  },
  emits: ['saved'],
  data() {
    return {
      federations: [],
      federationsLoading: false,
      loadError: '',
      licenseMap: {}, // code -> { number, touched }
      saving: false,
      saveError: '',
    };
  },
  computed: {
    federationsForDisplay() {
      return this.federations.filter((f) => f.code !== 'LEGACY');
    },
  },
  watch: {
    userId: {
      immediate: true,
      handler() {
        this.loadFederations();
      },
    },
    licenses: {
      immediate: true,
      handler() {
        this.rebuildLicenseMap();
      },
    },
  },
  methods: {
    token() {
      return localStorage.getItem('accessToken');
    },
    rebuildLicenseMap() {
      const map = {};
      for (const fed of this.federationsForDisplay) {
        const found = this.licenses.find((l) => l?.federation?.code === fed.code);
        map[fed.code] = { number: found?.number_plain || '', touched: false };
      }
      this.licenseMap = map;
    },
    async loadFederations() {
      this.federationsLoading = true;
      this.loadError = '';
      try {
        const base = this.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${base}/users/federations`);
        if (!res.ok) throw new Error('Erreur chargement fédérations');
        this.federations = await res.json();
        this.rebuildLicenseMap();
      } catch (e) {
        this.loadError = e?.message || 'Erreur de chargement';
      } finally {
        this.federationsLoading = false;
      }
    },
    markTouched(code) {
      if (this.licenseMap[code]) this.licenseMap[code].touched = true;
    },
    async save() {
      const base = this.baseUrl.replace(/\/+$/, '');
      const touched = Object.entries(this.licenseMap).filter(([, v]) => v.touched);
      if (touched.length === 0) return;

      this.saving = true;
      this.saveError = '';
      try {
        for (const [federationCode, v] of touched) {
          const res = await fetch(`${base}/users/${this.userId}/licenses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token()}`,
            },
            body: JSON.stringify({ federationCode, number: v.number.trim() || null }),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`Échec licences: ${res.status} ${txt}`);
          }
        }
        this.$emit('saved');
      } catch (e) {
        this.saveError = e?.message || 'Erreur lors de l’enregistrement';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
