<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des événements</h2>
    <div class="max-w-screen-lg mx-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="bg-gray-200">
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-center max-w-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Intitulé
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-300 divide-y divide-gray-200">
          <tr v-for="(event, index) in paginatedEvents" :key="event.id">
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
            >
              {{ formatDate(event.date_event) }}
            </td>
            <td
              class="px-3 py-2 max-w-20 text-sm text-black font-semibold uppercase"
            >
              {{ event.name_event }}
            </td>
            <td
              class="flex flex-col px-3 py-2 whitespace-nowrap text-sm font-semibold text-black"
            >
              <button
                @click="emitEditEvent(event)"
                class="bg-blue-500 mb-1 text-white px-4 py-1 rounded-md hover:bg-blue-600"
              >
                Modifier
              </button>
              <button
                @click="emitDeleteEvent(event.id)"
                class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination controls -->
    <div class="mt-4 flex justify-center">
      <button
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-center text-black font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        @click="prevPage"
        :class="{ hidden: currentPage === 1 }"
        :disabled="currentPage === 1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z"
          />
        </svg>
      </button>
      <span class="mx-4">{{ currentPage }}/{{ totalPages }}</span>
      <button
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-center text-black font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        @click="nextPage"
        :class="{ hidden: currentPage === totalPages }"
        :disabled="currentPage === totalPages"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="m12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      pageSize: 6,
      currentPage: 1,
    };
  },
  computed: {
    paginatedEvents() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.events.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.events.length / this.pageSize);
    },
  },
  methods: {
    emitEditEvent(event) {
      this.$emit("edit-event", event);
    },
    emitDeleteEvent(eventId) {
      this.$emit("delete-event", eventId);
    },
    formatDate(date) {
      return this.$parent.formatDate(date);
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
};
</script>
