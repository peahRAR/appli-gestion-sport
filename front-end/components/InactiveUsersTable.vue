<template>
  <div class="mb-8 bg-white rounded" style="overflow-x: auto">
    <h2 class="text-xl font-semibold mb-2">Utilisateurs inactifs</h2>
    <div class="max-w-screen-lg mx-auto">
      <table class="mx-auto min-w-full divide-y divide-gray-200">
        <!-- Table header -->
        <thead class="bg-gray-200">
          <tr class="flex justify-between w-full">
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nom
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Prénom
            </th>
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          class="flex flex-col justify-between bg-gray-300 divide-y divide-gray-200"
        >
          <!-- Table rows -->
          <tr
            v-for="(user, index) in paginatedUsers"
            :key="user.id"
            class="flex justify-between items-center w-full"
          >
            <td
              class="px-3 py-2 whitespace-nowrap font-semibold text-sm text-black capitalize"
            >
              {{ user.name }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap font-semibold text-sm text-black capitalize"
            >
              {{ user.firstname }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap font-semibold text-sm text-black"
            >
              <button
                @click="reactivate(user)"
                class="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
              >
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
              <button
                @click="remove(user)"
                class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 ml-2"
              >
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
      <!-- Pagination controls -->
      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-center">
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
  </div>
</template>

<script>
export default {
  props: {
    inactiveUsers: {
      type: Array,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 5,
    }
  },
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    paginatedUsers() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.inactiveUsers.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.inactiveUsers.length / this.pageSize);
    },
  },
  methods: {
    reactivate(user) {
      this.$emit("reactivate", user);
    },
    remove(user) {
      this.$emit("delete", user);
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
