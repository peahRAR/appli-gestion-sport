<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des alertes</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Titre
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date de fin
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
          <tr v-for="(alert, index) in alerts" :key="alert.id" class="w-full justify-between items-center">
            <td class="w-3 px-3 py-4">{{ alert.titre }}</td>
            <td class="w-3 px-3 py-4 whitespace-nowrap">{{ formatAlertDate(alert.dateFin) }}</td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <button @click="deleteAlert(alert.id)" class="bg-red-500 text-white p-1 rounded-md hover:bg-red-600">
                <!-- Icône de suppression -->
                <svg
                  class="h-4 w-4 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
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
    alerts: {
      type: Array,
      required: true
    }
  },
  methods: {
    deleteAlert(alertId) {
      this.$emit('delete-alert', alertId);
    },
    formatAlertDate(date) {
      return this.$parent.formatDate(date);
    }
    // Autres méthodes...
  }
}
</script>
