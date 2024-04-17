<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
    <!-- Filter and sort section -->
    <div class="flex justify-between">
      <div class="flex items-center space-x-4 mb-4">
        <select
          v-model="currentSortBy"
          class="block bg-white border border-gray-400 hover:border-gray-500 py-2 rounded shadow leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
        >
          <option value="null">Trier par ...</option>
          <option v-for="cat in sortByList" :value="cat.value">
            {{ cat.cat }}
          </option>
        </select>
        <div class="flex">
          <button
            @click="updateSortOrder()"
            class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              v-if="asc"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M128 128a12 12 0 0 1-12 12H48a12 12 0 0 1 0-24h68a12 12 0 0 1 12 12M48 76h132a12 12 0 0 0 0-24H48a12 12 0 0 0 0 24m52 104H48a12 12 0 0 0 0 24h52a12 12 0 0 0 0-24m132.49-20.49a12 12 0 0 0-17 0L196 179v-67a12 12 0 0 0-24 0v67l-19.51-19.52a12 12 0 0 0-17 17l40 40a12 12 0 0 0 17 0l40-40a12 12 0 0 0 0-16.97"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M36 128a12 12 0 0 1 12-12h68a12 12 0 0 1 0 24H48a12 12 0 0 1-12-12m12-52h52a12 12 0 0 0 0-24H48a12 12 0 0 0 0 24m132 104H48a12 12 0 0 0 0 24h132a12 12 0 0 0 0-24m52.49-100.49l-40-40a12 12 0 0 0-17 0l-40 40a12 12 0 0 0 17 17L172 77v67a12 12 0 0 0 24 0V77l19.51 19.52a12 12 0 0 0 17-17Z"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- Filter section -->
      <div class="flex items-center space-x-4 mb-4">
        <select
          v-model="filterOption"
          class="block w-24 bg-white border border-gray-400 hover:border-gray-500 py-2 rounded shadow leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
        >
           <option v-for="cat in filterList" :value="cat.value">
            {{ cat.filter }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="mx-auto min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="bg-gray-200">
            <th
              scope="col"
              class="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Statut
              <!-- Ajoutez l'icône pour le statut ici -->
            </th>
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
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(user, index) in paginatedSortedUsers"
            :key="user.id"
            :class="userBgColor(user)"
          >
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
              <!-- Icon Status -->
              <span>
                <!-- Cash icon if date_end_pay is null or < date of the day -->
                <svg
                  v-if="
                    !user.date_end_pay ||
                    new Date(user.date_end_pay) < new Date()
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 256 256"
                >
                  <g fill="text-black">
                    <path
                      d="M160 128a32 32 0 1 1-32-32a32 32 0 0 1 32 32m40-64a48.85 48.85 0 0 0 40 40V64Zm0 128h40v-40a48.85 48.85 0 0 0-40 40M16 152v40h40a48.85 48.85 0 0 0-40-40m0-48a48.85 48.85 0 0 0 40-40H16Z"
                      opacity=".2"
                    />
                    <path
                      d="M128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m112-96H16a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h224a8 8 0 0 0 8-8V64a8 8 0 0 0-8-8M24 72h21.37A40.81 40.81 0 0 1 24 93.37Zm0 112v-21.37A40.81 40.81 0 0 1 45.37 184Zm208 0h-21.37A40.81 40.81 0 0 1 232 162.63Zm0-38.35A56.78 56.78 0 0 0 193.65 184H62.35A56.78 56.78 0 0 0 24 145.65v-35.3A56.78 56.78 0 0 0 62.35 72h131.3A56.78 56.78 0 0 0 232 110.35Zm0-52.28A40.81 40.81 0 0 1 210.63 72H232Z"
                    />
                  </g>
                </svg>
                <!-- Id Card icon if license is null -->
                <svg
                  v-if="!user.license"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="text-black"
                    d="M14 13h5v-2h-5zm0-3h5V8h-5zm-9 6h8v-.55q0-1.125-1.1-1.787T9 13q-1.8 0-2.9.663T5 15.45zm4-4q.825 0 1.413-.587T11 10q0-.825-.587-1.412T9 8q-.825 0-1.412.588T7 10q0 .825.588 1.413T9 12m-5 8q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6z"
                  />
                </svg>
              </span>
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
            >
              {{ user.name }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
            >
              {{ user.firstname }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-center pt-4 text-gray-500"
            >
              <button
                @click="openModal(user)"
                class="focus:outline-none text-black"
              >
                <!-- Arrow bottom -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-black hover:text-gray-600 transition duration-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 12l-6-6h12l-6 6z"
                    clip-rule="evenodd"
                  />
                </svg>
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
    users: {
      type: Array,
      required: true,
    },
    sortByList: {
      type: Array,
      required: true,
    },
    filterList: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      asc: true,
      currentSortBy: null,
      currentPage: 1,
      pageSize: 5,
      filterOption: "all",
    };
  },
  methods: {
    openModal(user) {
      this.$emit("open-modal", user);
    },
    // Update Sort Order
    updateSortOrder() {
      this.asc = !this.asc;
    },
    userBgColor(user) {
      if (user) {
        if (
          !user.license &&
          (!user.date_end_pay || new Date(user.date_end_pay) < new Date())
        ) {
          return "bg-red-500 bg-opacity-75";
        }
        if (
          !user.license ||
          !user.date_end_pay ||
          new Date(user.date_end_pay) < new Date()
        ) {
          return "bg-orange-500 bg-opacity-75";
        }
        if (
          user.license &&
          user.date_end_pay &&
          new Date(user.date_end_pay) >= new Date()
        ) {
          return "bg-white";
        }
      }
      // Si user n'est pas défini, retournez une classe par défaut
      return "bg-gray-300"; // Ou toute autre classe par défaut que vous souhaitez utiliser
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
    filterUsers(users) {
      switch (this.filterOption) {
        case "isActive":
          return users.filter((user) => user.isActive);
        case "homme":
          return users.filter((user) => user.gender === true);
        case "femme":
          return users.filter((user) => user.gender === false);
        case "dateEndPay":
          return users.filter(
            (user) =>
              !user.date_end_pay || new Date(user.date_end_pay) < new Date()
          );
        default:
          return users;
      }
    },
  },
  computed: {
    sortedUsers() {
      if (!this.currentSortBy) {
        return this.users;
      }
      return [...this.users].sort((a, b) => {
        let modifier = this.asc ? 1 : -1;
        let valA = a[this.currentSortBy] || "";
        let valB = b[this.currentSortBy] || "";
        return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0;
      });
    },
    paginatedSortedUsers() {
      const filteredUsers = this.filterUsers(this.sortedUsers);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return filteredUsers.slice(startIndex, endIndex);
    },
    totalPages() {
      const filteredUsers = this.filterUsers(this.sortedUsers); // Appliquer le filtre aux utilisateurs
      return Math.ceil(filteredUsers.length / this.pageSize); // Calculer le nombre de pages en fonction des utilisateurs filtrés
    },
    filteredUsers() {
      // Appliquer le filtre aux utilisateurs en fonction des options de filtrage
      let filteredUsers = this.users;
      // Ajoutez le code pour filtrer les utilisateurs en fonction des options de filtrage
      return filteredUsers;
    },
  },
};
</script>
