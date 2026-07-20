<template>
  <div v-if="isSuperAdmin">
    <h2 class="text-xl font-semibold mb-2 text-red-600">Purge de fin de saison</h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Action réservée au Super Admin. Vide définitivement le numéro de licence ou les dates de
      paiement de <strong>tous les adhérents</strong>. Les comptes et le reste de leurs informations
      ne sont pas touchés.
    </p>
    <div class="flex flex-wrap gap-3">
      <button @click="openConfirm('licenses')"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
        Purger toutes les licences
      </button>
      <button @click="openConfirm('payments')"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
        Purger tous les paiements
      </button>
    </div>

    <TheModal :isOpen="pendingAction !== null" title="Confirmer la purge" @close="cancel">
      <div class="flex flex-col items-center gap-4">
        <p class="text-center">
          Cette action est <strong>irréversible</strong> et va vider
          <strong>{{ pendingAction === 'licenses' ? 'le numéro de licence' : 'les dates de paiement' }}</strong>
          de tous les adhérents.
        </p>
        <p class="text-center text-sm">
          Tapez <strong>PURGER</strong> pour confirmer.
        </p>
        <input v-model="confirmationInput" type="text"
          class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-sm px-3 py-2 text-center"
          placeholder="PURGER" />
        <div class="flex gap-3">
          <button @click="confirmPurge" :disabled="confirmationInput !== 'PURGER' || isPurging"
            class="px-4 py-2 rounded-lg text-white font-semibold"
            :class="confirmationInput === 'PURGER' && !isPurging ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'">
            {{ isPurging ? 'Purge en cours…' : 'Confirmer la purge' }}
          </button>
          <button @click="cancel"
            class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold dark:bg-gray-900 dark:text-gray-100">
            Annuler
          </button>
        </div>
      </div>
    </TheModal>
  </div>
</template>

<script>
export default {
  name: 'PurgeSection',
  props: {
    baseUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      pendingAction: null, // 'licenses' | 'payments' | null
      confirmationInput: '',
      isPurging: false,
    };
  },
  computed: {
    isSuperAdmin() {
      return this.getUserRole() === 2;
    },
  },
  methods: {
    getUserRole() {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      try {
        return JSON.parse(atob(parts[1])).role;
      } catch {
        return null;
      }
    },
    openConfirm(action) {
      this.pendingAction = action;
      this.confirmationInput = '';
    },
    cancel() {
      this.pendingAction = null;
      this.confirmationInput = '';
    },
    async confirmPurge() {
      if (this.confirmationInput !== 'PURGER' || !this.pendingAction) return;
      const token = localStorage.getItem("accessToken");
      const action = this.pendingAction;
      this.isPurging = true;
      try {
        const response = await fetch(`${this.baseUrl}/admin/purge/${action}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        const result = await response.json();
        alert(`Purge effectuée : ${result.affectedCount} enregistrement(s) vidé(s).`);
      } catch (error) {
        console.error('Erreur lors de la purge:', error);
        alert("Une erreur est survenue pendant la purge.");
      } finally {
        this.isPurging = false;
        this.pendingAction = null;
        this.confirmationInput = '';
      }
    },
  },
};
</script>
