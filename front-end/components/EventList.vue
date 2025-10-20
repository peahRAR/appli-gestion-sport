<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des cours</h2>
    <div class="w-full">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="bg-gray-200">
            <th class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-3 py-1 text-center max-w-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Intitulé</th>
            <th class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visibilité</th>
            <th class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <tbody class="bg-gray-300 divide-y divide-gray-200">
          <tr v-for="(event, index) in paginatedEvents" :key="event.id">
            <td class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize">
              {{ formatDate(event.date_event) }}
            </td>

            <td class="px-3 py-2 max-w-20 text-sm text-black font-semibold uppercase">
              {{ event.name_event }}
            </td>

            <!-- Colonne Visibilité avec toggle -->
            <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-black">
              <div class="flex items-center justify-center gap-3">
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" class="sr-only peer" :checked="isVisible(event)"
                    :disabled="loadingId === event.id" @change="onToggleVisibility(event)"
                    aria-label="Basculer la visibilité du cours" />
                  <div
                    class="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-200">
                  </div>
                  <div
                    class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5">
                  </div>
                </label>

                <span class="text-xs px-2 py-0.5 rounded-full"
                  :class="isVisible(event) ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'">
                  {{ isVisible(event) ? 'Visible' : 'Masqué' }}
                </span>
              </div>
            </td>

            <td class="flex flex-col px-3 py-2 whitespace-nowrap text-sm font-semibold text-black">
              <button @click="emitEditEvent(event)"
                class="bg-blue-500 mb-1 text-white px-4 py-1 rounded-md hover:bg-blue-600">
                Modifier
              </button>
              <button @click="emitDeleteEvent(event.id)"
                class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-center">
      <button
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-center text-black font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        @click="prevPage" :class="{ hidden: currentPage === 1 }" :disabled="currentPage === 1">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z" />
        </svg>
      </button>
      <span class="mx-4">{{ currentPage }}/{{ totalPages }}</span>
      <button
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-center text-black font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        @click="nextPage" :class="{ hidden: currentPage === totalPages }" :disabled="currentPage === totalPages">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
          <path fill="currentColor" d="m12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
    baseUrl: { type: String, required: true }, 
  },
  data() {
    return { pageSize: 6, currentPage: 1, loadingId: null };
  },
  computed: {
    paginatedEvents() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.events.slice(startIndex, startIndex + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.events.length / this.pageSize) || 1;
    },
  },
  methods: {
    isVisible(ev) {
      return typeof ev?.isVisible === 'boolean'
        ? ev.isVisible
        : (typeof ev?.is_visible === 'boolean' ? ev.is_visible : true);
    },

    async onToggleVisibility(event) {
      const next = !this.isVisible(event);
      const prev = this.isVisible(event);

      // UI optimiste
      event.isVisible = next;
      event.is_visible = next;
      this.loadingId = event.id;

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${this.baseUrl}/events/${event.id}/visibility`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_visible: next }),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }

        // Optionnel : aligner sur la valeur renvoyée par le serveur
        const saved = await res.json().catch(() => null);
        const serverVal = typeof saved?.isVisible === 'boolean'
          ? saved.isVisible
          : (typeof saved?.is_visible === 'boolean' ? saved.is_visible : next);

        event.isVisible = serverVal;
        event.is_visible = serverVal;
      } catch (e) {
        console.error("Maj visibilité échouée :", e);
        // rollback UI
        event.isVisible = prev;
        event.is_visible = prev;
        // Option: afficher un toast/modal d’erreur ici si tu veux
      } finally {
        this.loadingId = null;
      }
    },

    emitEditEvent(event) { this.$emit("edit-event", event); },
    emitDeleteEvent(eventId) { this.$emit("delete-event", eventId); },
    formatDate(date) { return this.$parent.formatDate(date); },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    prevPage() { if (this.currentPage > 1) this.currentPage--; },
  },
};
</script>

