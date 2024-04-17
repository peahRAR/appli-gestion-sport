<template>
  <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
    <h2 class="text-xl font-semibold mb-2">Utilisateurs inactifs</h2>
    <div class="overflow-x-hidden">
      <table class="mx-auto min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="flex justify-between w-full">
            <th scope="col" class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th scope="col" class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th scope="col" class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="flex justify-between bg-white divide-y divide-gray-200">
          <tr v-for="(user, index) in inactiveUsers" :key="user.id" class="flex justify-between items-center w-full">
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">{{ user.name.data }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">{{ user.firstname.data }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
              <button @click="reactivate(user)" class="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-blue-600">
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
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
              </button>
              <button @click="remove(user)" class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 ml-2">
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
    inactiveUsers: {
      type: Array,
      required: true
    }
  },
  methods: {
    reactivate(user) {
      this.$emit('reactivate', user);
    },
    remove(user) {
      this.$emit('delete', user);
    }
  }
}
</script>
