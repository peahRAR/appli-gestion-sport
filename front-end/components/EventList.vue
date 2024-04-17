<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des événements</h2>
    <div class="max-w-screen-lg mx-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-left max-w-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Intitulé
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(event, index) in events" :key="event.id">
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize"
            >
              {{ formatDate(event.date_event) }}
            </td>
            <td class="px-3 py-2 max-w-20 text-sm text-gray-500 uppercase">
              {{ event.name_event }}
            </td>
            <td
              class="flex flex-col px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-500"
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
  </div>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true
    }
  },
  methods: {
    emitEditEvent(event) {
      this.$emit('edit-event', event);
    },
    emitDeleteEvent(eventId) {
      this.$emit('delete-event', eventId);
      },
    formatDate(date) {
      return this.$parent.formatDate(date);
    }
    // Autres méthodes...
  }
}
</script>
