<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
    <!-- Filter and sort section -->
    <div class="flex items-center space-x-4 mb-4">
      <select @change="updateSortBy($event.target.value)">
        <option value="">Trier par...</option>
        <option value="age">Âge</option>
        <option value="gender">Genre</option>
        <option value="weight">Poids</option>
        <option value="name">Nom</option>
        <!-- Ajout du tri par nom -->
      </select>
      <div class="flex">
        <input
          type="radio"
          id="asc"
          value="asc"
          v-model="sortOrder"
          @change="updateSortOrder('asc')"
          class="hidden"
        />
        <label
          for="asc"
          class="cursor-pointer bg-gray-200 px-4 py-2 mr-4 rounded-md"
          :class="{ 'bg-gray-500 text-white': sortOrder === 'asc' }"
          >Croissant</label
        >

        <input
          type="radio"
          id="desc"
          value="desc"
          v-model="sortOrder"
          @change="updateSortOrder('desc')"
          class="hidden"
        />
        <label
          for="desc"
          class="cursor-pointer bg-gray-200 px-4 py-2 rounded-md"
          :class="{ 'bg-gray-500 text-white': sortOrder === 'desc' }"
          >Décroissant</label
        >
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
            v-for="(user, index) in sortedUsers"
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
              {{ user.name.data }}
            </td>
            <td
              class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
            >
              {{ user.firstname.data }}
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
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  methods: {
    openModal(user) {
      this.$emit("open-modal", user);
    },
    // Update Sort By
    updateSortBy(value) {
      this.sortBy = value; // Mettre à jour la variable sortBy avec la valeur sélectionnée
      this.handleSort(); // Appeler la méthode handleSort pour effectuer le tri
    },
    // Update Sort Order
    updateSortOrder(value) {
      this.sortOrder = value; // Mettre à jour la variable sortOrder avec la valeur sélectionnée
      this.handleSort(); // Appeler la méthode handleSort pour effectuer le tri
    },
    // Handle Sort
    async handleSort() {
      if (this.sortBy && this.sortOrder) {
        let sortedUsers = [...this.users];

        switch (this.sortBy) {
          case "age":
            sortedUsers.sort((a, b) => {
              const dateA = new Date(a.birthday.data);
              const dateB = new Date(b.birthday.data);
              return this.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            });
            break;
          case "gender":
            sortedUsers.sort((a, b) => {
              if (a.gender === b.gender) {
                return 0;
              } else if (this.sortOrder === "asc") {
                return a.gender ? -1 : 1;
              } else {
                return a.gender ? 1 : -1;
              }
            });
            break;
          case "weight":
            sortedUsers.sort((a, b) => {
              const weightA = a.weight !== null ? a.weight : 0;
              const weightB = b.weight !== null ? b.weight : 0;
              return this.sortOrder === "asc"
                ? weightA - weightB
                : weightB - weightA;
            });
            break;
          case "name":
            sortedUsers.sort((a, b) => {
              const nameA = a.name.data.toLowerCase();
              const nameB = b.name.data.toLowerCase();
              return this.sortOrder === "asc"
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
            });
            break;
        }

        this.$emit("update:users", sortedUsers);
      }
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
  },
  data() {
    return {
      sortBy: null, // handleSort BY
      sortOrder: null, // handleSort Order
    };
  },
  computed: {
    sortedUsers() {
      return this.users.slice(); // Retourne une copie triée des utilisateurs
    },
  },
};
</script>
