<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Gestion des Fédérations</h2>

    <!-- Alerts -->
    <p v-if="error" class="mb-3 text-red-600">{{ error }}</p>
    <p v-if="success" class="mb-3 text-green-700">{{ success }}</p>

    <!-- Tableau -->
    <table class="w-full border-collapse mb-4">
      <thead>
        <tr>
          <th class="text-center">Code</th>
          <th class="text-center">Nom</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="3" class="text-center py-4">Chargement…</td>
        </tr>

        <tr v-for="f in feds" :key="f.id">
          <td class="text-center font-mono">{{ f.code }}</td>
          <td class="text-center">
            <div v-if="editingId === f.id" class="flex justify-center">
              <input
                v-model="editName"
                type="text"
                class="w-64 rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nom de la fédération"
              />
            </div>
            <span v-else>{{ f.name }}</span>
          </td>
          <td class="text-center">
            <div v-if="editingId === f.id" class="flex items-center justify-center gap-2">
              <button
                class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500 disabled:opacity-50"
                :disabled="loading || !editName.trim()"
                @click="saveEdit(f)"
              >
                Enregistrer
              </button>
              <button
                class="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
                :disabled="loading"
                @click="cancelEdit"
              >
                Annuler
              </button>
            </div>
            <div v-else class="flex items-center justify-center gap-2">
              <button
                class="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
                :disabled="loading"
                @click="startEdit(f)"
              >
                Modifier
              </button>
              <button
                class="px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                :disabled="loading"
                @click="askDelete(f)"
              >
                Supprimer
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!loading && feds.length === 0">
          <td colspan="3" class="text-center py-4 text-slate-500">
            Aucune fédération.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Formulaire création -->
    <div class="rounded-xl border border-slate-200 p-4">
      <h3 class="text-sm font-semibold mb-3">Ajouter une fédération</h3>
      <form class="flex flex-col md:flex-row gap-3" @submit.prevent="createFed">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-600 mb-1">Code (unique, ex: FSGT)</label>
          <input
            v-model="createForm.code"
            type="text"
            class="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxlength="16"
            @input="createForm.code = createForm.code.toUpperCase().replace(/\s+/g,'')"
            placeholder="FMMAF"
            required
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-600 mb-1">Nom</label>
          <input
            v-model="createForm.name"
            type="text"
            class="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Fédération Française de MMA"
            required
          />
        </div>
        <div class="md:self-end">
          <button
            class="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 disabled:opacity-50"
            :disabled="loading || !createForm.code.trim() || !createForm.name.trim()"
            type="submit"
          >
            Créer
          </button>
        </div>
      </form>
    </div>

    <!-- Modal confirmation suppression -->
    <div v-if="confirmTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h4 class="text-base font-semibold">Supprimer la fédération</h4>
        <p class="mt-2 text-sm text-slate-600">
          Confirmer la suppression de
          <span class="font-medium">{{ confirmTarget.name }}</span> ({{ confirmTarget.code }}) ?
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50"
                  :disabled="loading"
                  @click="confirmTarget = null">
            Annuler
          </button>
          <button class="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                  :disabled="loading"
                  @click="doDelete">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FederationsManager',
  props: {
    baseUrl: { type: String, required: true }, // ex: https://api.monsite.tld
  },
  data() {
    return {
      feds: [],
      loading: false,
      error: null,
      success: null,
      editingId: null,
      editName: '',
      confirmTarget: null,
      createForm: { code: '', name: '' },
    }
  },
  methods: {
    authHeaders() {
      const token = localStorage.getItem('accessToken')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },

    async fetchFeds() {
      try {
        this.loading = true
        this.error = null
        const res = await fetch(`${this.baseUrl}/users/federations`)
        if (!res.ok) throw new Error('Erreur au chargement des fédérations')
        this.feds = await res.json()
      } catch (e) {
        this.error = e?.message || 'Erreur au chargement'
      } finally {
        this.loading = false
      }
    },

    startEdit(f) {
      this.editingId = f.id
      this.editName = f.name
      this.success = null
      this.error = null
    },
    cancelEdit() {
      this.editingId = null
      this.editName = ''
    },
    async saveEdit(f) {
      if (!this.editingId) return
      try {
        this.loading = true
        this.error = null
        this.success = null

        const res = await fetch(`${this.baseUrl}/admin/federations/${f.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...this.authHeaders(),
          },
          body: JSON.stringify({ name: this.editName }),
        })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || 'Échec de la mise à jour')
        }
        // MAJ locale
        const idx = this.feds.findIndex(x => x.id === f.id)
        if (idx >= 0) this.feds[idx] = { ...f, name: this.editName }
        this.success = 'Fédération mise à jour.'
        this.cancelEdit()
      } catch (e) {
        this.error = e?.message || 'Échec de la mise à jour'
      } finally {
        this.loading = false
      }
    },

    askDelete(f) {
      this.confirmTarget = f
    },
    async doDelete() {
      const f = this.confirmTarget
      if (!f) return
      try {
        this.loading = true
        this.error = null
        this.success = null

        const res = await fetch(`${this.baseUrl}/admin/federations/${f.id}`, {
          method: 'DELETE',
          headers: { ...this.authHeaders() },
        })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || 'Échec de la suppression')
        }
        this.feds = this.feds.filter(x => x.id !== f.id)
        this.success = 'Fédération supprimée.'
      } catch (e) {
        this.error = e?.message || 'Échec de la suppression'
      } finally {
        this.loading = false
        this.confirmTarget = null
      }
    },

    async createFed() {
      try {
        this.loading = true
        this.error = null
        this.success = null

        const payload = {
          code: this.createForm.code.trim().toUpperCase(),
          name: this.createForm.name.trim(),
        }
        if (!payload.code || !payload.name) {
          this.error = 'Code et nom requis.'
          return
        }

        const res = await fetch(`${this.baseUrl}/admin/federations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.authHeaders(),
          },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || 'Échec de la création')
        }
        const created = await res.json()
        this.feds.unshift(created)
        this.success = 'Fédération créée.'
        this.createForm = { code: '', name: '' }
      } catch (e) {
        this.error = e?.message || 'Échec de la création'
      } finally {
        this.loading = false
      }
    },
  },
  async mounted() {
    await this.fetchFeds()
  },
}
</script>

<style scoped>
th, td { @apply border text-center border-solid border-slate-200 p-3; }
th { background-color: #f9f9f9; }
</style>
