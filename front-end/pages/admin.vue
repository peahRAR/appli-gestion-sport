<template>
  <div class="mb-6">
    <TheSkeleton v-if="loading" />
    <div v-else>
      <div class="container mx-auto py-8">
        <h1 class="text-3xl ml-2 font-semibold mb-4">
          Administration de l'application
        </h1>
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <h2 class="text-xl font-semibold mb-2">Utilisateurs inactifs</h2>
          <div class="overflow-x-auto">
            <!-- Unactivate users Table  -->
            <table class="mx-auto min-w-full divide-y divide-gray-200">
              <!-- Unactivate users table header  -->
              <thead class="bg-gray-50">
                <tr>
                  <!-- Name -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <!-- Firstname -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prénom
                  </th>
                  <!-- Actions -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <!-- Unactivate user table value -->
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(user, index) in inactiveUsers" :key="user.id">
                  <!-- Name -->
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize"
                  >
                    {{ user.name.data }}
                  </td>
                  <!-- Firstname -->
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize"
                  >
                    {{ user.firstname.data }}
                  </td>
                  <!-- Button For activate User -->
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <button
                      @click="reactivateUser(user)"
                      class="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                    >
                      Activer
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 ml-2"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- USERS List -->
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <h2 class="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
          <div class="flex items-center space-x-4 mb-4">
            <!-- handleSort BY -->
            <select @change="updateSortBy($event.target.value)">
              <option value="">Trier par...</option>
              <option value="age">Âge</option>
              <option value="gender">Genre</option>
              <option value="weight">Poids</option>
              <option value="name">Nom</option>
              <!-- Ajout du tri par nom -->
            </select>
            <!-- handleSort ORDER -->
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

          <!-- User Table -->
          <div class="overflow-x-auto">
            <table class="mx-auto min-w-full divide-y divide-gray-200">
              <!-- Table user Header -->
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                    <!-- Ajoutez l'icône pour le statut ici -->
                  </th>
                  <!-- Name -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <!-- Firstname -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prénom
                  </th>
                  <!-- Action -->
                  <th
                    scope="col"
                    class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <!-- User Table Value -->
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(user, index) in users"
                  :key="user.id"
                  :class="{
                    'bg-orange-600':
                      !user.license ||
                      !user.date_end_pay ||
                      new Date(user.date_end_pay) < new Date(),
                    'bg-red-600':
                      !user.license &&
                      (!user.date_end_pay ||
                        new Date(user.date_end_pay) < new Date()),
                    'bg-white':
                      user.license &&
                      (!user.date_end_pay ||
                        new Date(user.date_end_pay) >= new Date()),
                  }"
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
                  <!-- Name -->
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
                  >
                    {{ user.name.data }}
                  </td>
                  <!-- Firstname -->
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm text-black font-semibold capitalize"
                  >
                    {{ user.firstname.data }}
                  </td>
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-500"
                  >
                    <!-- Button open modal -->
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
        <!-- Add Alert Form -->
        <div class="bg-white mx-2 rounded p-2 mb-10">
          <!-- Title Section -->
          <h2 class="text-xl font-semibold mb-2">Ajouter une alerte</h2>
          <form @submit.prevent="submitAlert" class="flex flex-col space-y-4">
            <!-- Titre -->
            <div class="flex flex-col">
              <label for="titre" class="font-semibold">Titre :</label>
              <input
                type="text"
                v-model="newAlert.titre"
                id="titre"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
                required
              />
            </div>
            <!-- Contenu -->
            <div class="flex flex-col">
              <label for="contenu" class="font-semibold">Contenu :</label>
              <textarea
                v-model="newAlert.contenu"
                id="contenu"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
                required
              ></textarea>
            </div>
            <!-- Date de fin -->
            <div class="flex flex-col">
              <label for="dateFin" class="font-semibold"
                >Date de fin de validité :</label
              >
              <input
                type="date"
                v-model="newAlert.dateFin"
                id="dateFin"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
                required
              />
            </div>
            <!-- Bouton de soumission -->
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Ajouter l'alerte
            </button>
          </form>
        </div>
        <!-- Liste des alertes -->
        <div class="mb-8 bg-white mx-2 rounded p-2 overflow-x-auto">
          <h2 class="text-xl font-semibold mb-2">Liste des alertes</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <!-- Table alert Header -->
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
              <!-- Alert Table Value -->
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(alert, index) in alerts" :key="alert.id">
                  <td class="px-3 py-4 whitespace-nowrap">{{ alert.titre }}</td>
                  <td class="px-3 py-4 whitespace-nowrap">
                    {{ formatDate(alert.dateFin) }}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap flex flex-col">
                    <button
                      @click="deleteAlert(alert.id)"
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
        <!-- Create Event Form  -->
        <div class="bg-white mx-2 rounded p-2">
          <!-- Title Section -->
          <h2 class="text-xl font-semibold mb-2">Créer un nouveau cours</h2>
          <form @submit.prevent="createCourse" class="flex flex-col space-y-4">
            <!-- Name Event -->
            <div class="flex flex-col">
              <label for="title" class="font-semibold">Titre du cours</label>
              <input
                type="text"
                v-model="newCourse.name_event"
                id="title"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              />
            </div>
            <!-- Overview -->
            <div class="flex flex-col">
              <label for="description" class="font-semibold"
                >Description du cours</label
              >
              <textarea
                v-model="newCourse.overview"
                id="description"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
                placeholder=""
              ></textarea>
            </div>
            <!-- Date -->
            <div class="flex flex-col">
              <label for="date">Date et heure de début</label>
              <input
                type="datetime-local"
                v-model="newCourse.date_event"
                id="date"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              />
            </div>
            <!-- Coach -->
            <div class="flex flex-col">
              <label for="coach">Nom du coach</label>
              <input
                type="text"
                v-model="newCourse.coach"
                id="coach"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              />
            </div>
            <!-- Duration -->
            <div class="flex flex-col">
              <label for="duration">Durée du cours (en minutes)</label>
              <input
                type="number"
                v-model="durationInHours"
                id="duration"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              />
            </div>
            <!-- Total places -->
            <div class="flex flex-col">
              <label for="totalSeats">Nombre de places total disponibles</label>
              <input
                type="number"
                v-model="newCourse.totalPlaces"
                id="totalSeats"
                class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              />
            </div>
            <!-- Submit Button -->
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Créer le cours
            </button>
          </form>
        </div>
      </div>

      <!-- Event Table -->
      <div class="mb-8 bg-white mx-2 rounded p-2 overflow-x-auto">
        <!-- Section name -->
        <h2 class="text-xl font-semibold mb-2">Liste des événements</h2>
        <div class="max-w-screen-lg mx-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <!-- Row Table header -->
            <thead class="bg-gray-50">
              <tr>
                <!-- Date -->
                <th
                  scope="col"
                  class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <!-- Name -->
                <th
                  scope="col"
                  class="px-3 py-1 text-left max-w-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Intitulé
                </th>
                <!-- Action -->
                <th
                  scope="col"
                  class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <!--Row Value Database -->
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(event, index) in events" :key="event.id">
                <!-- Event Date -->
                <td
                  class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize"
                >
                  {{ formatDate(event.date_event) }}
                </td>
                <!-- Event Name -->
                <td
                  class="px-3 py-2 max-w-20 whitespace-nowrap text-sm text-gray-500 uppercase"
                >
                  {{ event.name_event }}
                </td>
                <td
                  class="flex flex-col px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-500"
                >
                  <!-- Button Modify Event -->
                  <button
                    @click="editEvent(event)"
                    class="bg-blue-500 mb-1 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                  <!-- Button Delete Event -->
                  <button
                    @click="deleteEvent(event.id)"
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
      <TheModal
        :isOpen="showModalSelectedUser"
        title="Informations utilisateurs"
        @close="closeModalUser"
      >
        <!-- Modale Utilisateur  -->
        <!-- Input Name -->
        <div class="mb-2 mt-4">
          <NuxtImg
            v-if="selectedUser.avatar"
            :src="selectedUser.avatar.data"
            alt="Avatar"
            class="w-28 h-28 rounded-full mx-auto mb-4"
          />
          <!-- If Avatar === null -->
          <div
            v-else
            class="w-28 h-28 mb-4 rounded-full bg-gray-300 mx-auto flex items-center justify-center"
          >
            <span class="text-gray-600 text-4xl"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
    3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
    8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
    2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6"
                />
              </svg>
            </span>
          </div>
          <label for="username"><strong>Nom:</strong></label>
          <input
            class="border border-gray-500 p-1"
            type="text"
            v-model="selectedUser.name.data"
            id="username"
          />
        </div>
        <!-- Input Firstname -->
        <div class="mb-2">
          <label for="userfirstname"><strong>Prénom:</strong></label>
          <input
            class="border border-gray-500 p-1"
            type="text"
            v-model="selectedUser.firstname.data"
            id="userfirstname"
          />
        </div>

        <p class="mb-2">
          <strong>E-mail:</strong> {{ selectedUser.email.data }}
        </p>
        <!-- Birthday -->
        <p class="mb-2">
          <strong>Date de naissance:</strong>
          {{ formatDate(selectedUser.birthday.data) }}
        </p>
        <!-- Gender -->
        <p class="mb-2">
          <strong>Genre:</strong> {{ selectedUser.gender ? "Homme" : "Femme" }}
        </p>
        <!-- Weight -->
        <p>
          <strong>Poids:</strong>
          {{
            (selectedUser.weight && selectedUser.weight.data + "Kg") ||
            "Non renseigné"
          }}
        </p>
        <!-- Tel Medic -->
        <p class="mb-2">
          <strong>Téléphone médical:</strong>
          {{
            (selectedUser.tel_medic && selectedUser.tel_medic.data) ||
            "Non renseigné"
          }}
        </p>
        <!-- Tel emergency -->
        <p class="mb-2">
          <strong>Téléphone d'urgence:</strong>
          {{
            (selectedUser.tel_emergency && selectedUser.tel_emergency.data) ||
            "Non renseigné"
          }}
        </p>
        <!-- Add Input for change the dates -->
        <!-- Payment input -->
        <div class="mb-2">
          <label for="datePayment"><strong>Date de paiement:</strong></label>
          <input
            class="border border-gray-500 p-1"
            type="date"
            v-model="selectedUser.date_payment"
            id="datePayment"
          />
          <span v-if="!selectedUser.date_payment">Aucun paiement en cours</span>
        </div>
        <!-- End Pay input -->
        <div class="mb-2">
          <label for="dateEndPay"
            ><strong> Date de fin de paiement:</strong></label
          >
          <input
            class="border border-gray-500 p-1"
            type="date"
            v-model="selectedUser.date_end_pay"
            id="dateEndPay"
          />
          <span v-if="!selectedUser.date_end_pay">Aucun paiement en cours</span>
        </div>
        <!-- Div For Place the buttons -->
        <div class="flex flex-row justify-between">
          <!-- Button For Update User -->
          <button
            @click="updateUser"
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Enregistrer
          </button>
          <!-- Button fro delete user -->
          <button
            @click="deleteUser(selectedUser)"
            class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Supprimer Utilisateur
          </button>
          <!-- Button For change role user -->
          <div v-if="getUserRole() === 2">
            <button
              v-if="selectedUser.role === 0"
              @click="changeUserRole(selectedUser.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Passer Admin
            </button>
          </div>
        </div>
      </TheModal>
      <!-- Modal For Editing Event -->
      <TheModal
        :isOpen="showModal"
        title="Modifier l'évenement"
        @close="closeModal"
      >
        <!-- Modale pour l'édition de l'événement -->

        <form
          @submit.prevent="saveChanges(editedEvent.id)"
          data-event-id="editedEvent.id"
        >
          <!-- Event Name -->
          <div class="flex flex-col mb-4">
            <label for="title">Titre du cours : </label>
            <input
              type="text"
              v-model="editedEvent.name_event"
              id="title"
              class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
            />
          </div>
          <!-- Overview -->
          <div class="flex flex-col mb-4">
            <label for="description">Description du cours : </label>
            <textarea
              v-model="editedEvent.overview"
              id="description"
              class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
              placeholder=""
            ></textarea>
          </div>
          <!-- Coach -->
          <div class="flex flex-col mb-4">
            <label for="coach">Nom du coach : </label>
            <input
              type="text"
              v-model="editedEvent.coach"
              id="coach"
              class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
            />
          </div>
          <!-- Duration -->
          <div class="flex flex-col mb-4">
            <label for="duration">Durée du cours (en minutes) : </label>
            <input
              type="number"
              v-model="durationInHours"
              id="duration"
              class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
            />
          </div>
          <!-- Seats -->
          <div class="flex flex-col mb-4">
            <label for="totalSeats"
              >Nombre de places total disponibles :
            </label>
            <input
              type="number"
              v-model="editedEvent.totalPlaces"
              id="totalSeats"
              class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
            />
          </div>

          <!-- Button Save Changes -->
          <button
            type="submit"
            class="bg-green-500 w-full mt-4 text-white px-4 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Sauvegarder
          </button>
        </form>
      </TheModal>
      <TheModal
        :isOpen="showErrorModal"
        title="Message"
        @close="closeErrorModal"
        >{{ this.errorMessage }}</TheModal
      >
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      users: [], // User List
      newCourse: {
        // New Event to create
        name_event: null,
        overview: null,
        coach: null,
        date_event: null,
        duration: 0,
        totalPlaces: null,
        places: null,
      },
      newAlert: {
        titre: "",
        contenu: "",
        dateFin: "", // Champ pour la date de fin de validité de l'alerte
      },
      selectedUser: null, // user selected
      inactiveUsers: [], // Unactivate User
      events: [], // Events List
      showModal: false, // Open or Close Modal
      editedEvent: {}, // Modify Event
      sortBy: null, // handleSort BY
      sortOrder: null, // handleSort Order
      showModalSelectedUser: false, // Show or close Selected User
      loading: true,
      showErrorModal: false,
      errorMessage: null,
      alerts: [],
    };
  },
  async mounted() {
    // Get The element from the Api At the composant Mounted
    await this.checkUserRole(); // check UserRole
    await this.loadEvents(); // Events
    await this.loadUsers(); // Users
    await this.loadInactiveUsers(); // Inactive Users
    await this.fetchAlerts(); // Alerts
  },
  computed: {
    // Duration In Hours from minutes
    durationInHours: {
      get() {
        // Return The value of duration /60
        return this.newCourse.duration / 60;
      },
      set(value) {
        // Update newCourse.duration value * 60
        this.newCourse.duration = value * 60;
      },
    },
  },
  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    async checkUserRole() {
      // Récupérer le token d'accès depuis le localStorage
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        // Gérer le cas où il n'y a pas de token d'accès, par exemple, déconnecter l'utilisateur ou le rediriger vers la page de connexion
        document.location.href = "/";
        return;
      }

      // Vérifiez si le token est encore valide
      const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
      const expirationDate = new Date(decodedToken.exp * 1000); // Convertir la date d'expiration en millisecondes
      if (expirationDate < new Date()) {
        localStorage.removeItem("accessToken");
        // Redirection vers la page d'accueil si la date d'expiration est dépassée
        document.location.href = "/";
        return;
      }

      try {
        // Analyser le token d'accès pour obtenir les informations sur l'utilisateur, y compris son rôle
        const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));

        // Récupérer le rôle de l'utilisateur depuis les informations du token
        const userRole = tokenPayload.role;

        // Vérifiez si le rôle de l'utilisateur n'est pas égal à 1 ou 2
        if (userRole !== 1 && userRole !== 2) {
          // Rediriger l'utilisateur vers une autre page
          document.location.href = "/";
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse du token d'accès:", error);
        // Gérer les erreurs d'une manière appropriée, par exemple, déconnecter l'utilisateur ou afficher un message d'erreur
      }
    },
    async loadEvents() {
      const url = this.getUrl();
      try {
        const token = localStorage.getItem("accessToken");
        // Make a get request at the api for events
        const response = await useFetch(`${url}/events`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Keep the elements in Events
        this.events = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des événements", error);
      }
    },
    async createCourse() {
      try {
        this.newCourse.places = this.newCourse.totalPlaces;
        const duration = this.newCourse.duration * 60;
        const url = this.getUrl();
        const token = localStorage.getItem("accessToken");
        // Request Post for create new Event
        const response = await fetch(`${url}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.newCourse),
        });

        // Check if the request return status 200 (OK)
        if (response.ok) {
          // Retake all value like null string
          this.newCourse = {
            title: "",
            description: "",
            totalSeats: "",
            date_event: "",
            coach: "",
            duration: "",
          };
          // Return a success message at the user
          this.openErrorModal();
          this.errorMessage = "Le cours a été créé avec succès!";
          //refresh the evnts list
          this.loadEvents();
        } else {
          // In the Error case
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la création du cours";
        }
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la création du cours:"), error;
      }
    },
    async loadUsers() {
      try {
        const token = localStorage.getItem("accessToken");
        // Get Request at the Api for users
        const url = this.getUrl();
        const response = await useFetch(`${url}/users`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Keep all in Users Array
        this.users = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs", error);
      }
    },
    // Open Selected User Modal to show user details
    openModal(user) {
      this.selectedUser = user;
      this.showModalSelectedUser = true;
    },
    // Close User modal
    closeModalUser() {
      this.selectedUser = null;
      this.showModalSelectedUser = false;
    },
    // Format date
    formatDate(dateString) {
      // Convert string in object
      const date = new Date(dateString);

      // Format
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      let formattedDate = date.toLocaleDateString("fr-FR", options);

      // Extract the two last number of year
      const lastTwoDigitsOfYear = formattedDate.slice(-2);

      // Remove the year et ad the 2 last numbers of year
      formattedDate = formattedDate.replace(
        date.getFullYear(),
        lastTwoDigitsOfYear
      );

      return formattedDate;
    },
    // Update user method
    async updateUser() {
      try {
        if (!this.selectedUser) {
          console.error("Aucun utilisateur sélectionné.");
          return;
        }

        const token = localStorage.getItem("accessToken");
        const userId = this.selectedUser.id; // Keep the Selected user Id
        this.selectedUser.password = null;
        const url = this.getUrl();
        // Request patch to update the user
        const response = await fetch(`${url}/users/${userId}`, {
          method: "PATCH",
          mode: "cors",
          body: JSON.stringify({
            name: this.selectedUser.name.data,
            firstname: this.selectedUser.firstname.data,
            date_end_pay: this.selectedUser.date_end_pay,
            date_payment: this.selectedUser.date_payment,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the request throw a 200 status
        this.openErrorModal();
        (this.errorMessage = "Mise à jour réussie :"), response;
        this.loadUsers();
        this.closeModal();
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la mise à jour de l'utilisateur"),
          error;
        // Show error message if it not in status 200
      }
    },

    async loadInactiveUsers() {
      try {
        const token = localStorage.getItem("accessToken");
        // Get request for All users
        const url = this.getUrl();
        const response = await fetch(`${url}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if Response is OK (statut 200)
        if (response.ok) {
          // Covert the respons in JSON
          const allUsers = await response.json();
          // Filter Users
          this.inactiveUsers = allUsers.filter(
            (user) => user.isActive === false
          );
          this.loading = false;
        } else {
          // In error case show error message
          throw new Error(
            "Erreur lors du chargement des utilisateurs inactifs"
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des utilisateurs inactifs",
          error
        );
      }
    },
    // Method for activate user is not yet
    async reactivateUser(user) {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = user.id;
        const url = this.getUrl();
        // Patch Request at the api
        const response = await fetch(`${url}/admin/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh the list after an user were activate
        await this.loadInactiveUsers();

        // Check the response and showw error message if it's not ok
        this.openErrorModal();
        (this.errorMessage = "Utilisateur réactivé avec succès :"), response;
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la réactivation de l'utilisateur"),
          error;
        // Show error message
      }
    },
    async deleteUser(user) {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = user.id;
        const url = this.getUrl();

        // Supprimer la demande à l'API
        const response = await fetch(`${url}/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Si la réponse est réussie, supprimez l'utilisateur de la liste inactiveUsers
        if (response.ok) {
          this.openErrorModal();
          this.errorMessage = "L'utilisateur a été supprimé !";
          this.closeModalUser();
          this.loadUsers();
          this.loadInactiveUsers();
        } else {
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la suppression de l'utilisateur";
        }
      } catch (error) {
        // En cas d'erreur, afficher un message d'erreur ou gérer l'erreur en conséquence
        console.error(
          "Erreur lors de la suppression de l'utilisateur :",
          error
        );
        // Afficher un message d'erreur ou effectuer d'autres actions en cas d'erreur
      }
    },
    // Extract the user role from the token in localStorage
    getUserRole() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          return payload.role;
        } else {
          console.error("Token JWT invalide");
          return null;
        }
      } else {
        console.error("Token JWT introuvable dans le localStorage");
        return null;
      }
    },
    // Change the user role
    async changeUserRole(userId) {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Extract the Role of current user from the token payload
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            if (payload.role === 2) {
              const newRole = 1;
              const url = this.getUrl();
              const response = await fetch(
                `${url}/admin/${userId}/${newRole}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (response.ok) {
                this.openErrorModal();
                this.errorMessage =
                  "Le rôle de l'utilisateur a été modifié avec succès";
                this.loadUsers();
                this.closeModal();
              } else {
                this.openErrorModal();
                this.errorMessage =
                  "Erreur lors de la modification du rôle de l'utilisateur";
              }
            } else {
              this.openErrorModal();
              this.errorMessage =
                "Vous n'avez pas les permissions nécessaires pour effectuer cette action";
            }
          } else {
            throw new Error("Token JWT invalide");
          }
        } else {
          throw new Error("Token JWT introuvable dans le localStorage");
        }
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage =
          "Erreur lors de la modification du rôle de l'utilisateur :"),
          error;
      }
    },
    // Delete Event
    async deleteEvent(eventId) {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();
        const response = await fetch(`${url}/events/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.loadEvents();

          this.openErrorModal();
          this.errorMessage = "L'événement a été supprimé avec succès!";
        } else {
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la suppression de l'événement";
        }
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la suppression de l'événement:"),
          error;
      }
    },
    // Close the modal Event Modify
    closeModal() {
      // Réinitilized the input
      this.editedEvent = {};
      // Hidde the modal
      this.showModal = false;
    },
    // Edit Event
    editEvent(event) {
      this.editedEvent = { ...event };
      this.showModal = true;
    },
    // Update Event
    async saveChanges(eventId) {
      const token = localStorage.getItem("accessToken");
      const url = this.getUrl();
      try {
        if (eventId && typeof eventId === "number" && !isNaN(eventId)) {
          const response = await fetch(`${url}/events/${eventId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(this.editedEvent),
          });

          if (response.ok) {
            this.openErrorModal();
            this.errorMessage = "Événement modifié avec succès";
            //refresh the evnts list
            this.loadEvents();
          } else {
            this.openErrorModal();
            this.errorMessage = "Erreur lors de la modification de l'événement";
          }
        } else {
          this.openErrorModal();
          (this.errorMessage = "Identifiant d'événement non valide :"), eventId;
        }
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la modification de l'événement :"),
          error;
      } finally {
        this.closeModal();
        await this.loadEvents();
      }
    },
    openErrorModal() {
      this.showErrorModal = true;
    },
    //  Close Modal Password change
    closeErrorModal() {
      this.showErrorModal = false;

      this.errorMessage = "";
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

        this.users = sortedUsers;
      }
    },
    async submitAlert() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();
        // Envoyer les données au backend pour créer une nouvelle alerte
        const response = await fetch(`${url}/alerts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.newAlert),
        });

        if (!response.ok) {
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la création de l'alerte";
        }

        // Réinitialiser le formulaire
        this.newAlert.titre = "";
        this.newAlert.contenu = "";
        this.newAlert.dateFin = "";
        this.openErrorModal();
        this.errorMessage = "L'alerte à été ajoutée !";
      } catch (error) {
        console.error("Error adding alert:", error);
      }
    },
    async fetchAlerts() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();

        const response = await fetch(`${url}/alerts`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error(
            "Une Erreur est survenue durant la récupération des alertes"
          );
        }
        const data = await response.json();
        this.alerts = data;
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    },
    async deleteAlert(alertId) {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();

        const response = await fetch(`${url}/alerts/${alertId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          this.openErrorModal();
          this.errorMessage =
            "Une erreur s'est produite lors de la supression de l'alerte";
        }

        // Si la suppression réussit, vous pouvez mettre à jour vos données ou afficher un message de succès
        this.openErrorModal();
        this.errorMessage = "L'alerte à été suprimée avec succés !";

        // Mettre à jour les données, par exemple :
        this.fetchAlerts();
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'alerte :",
          error.message
        );
      }
    },
  },
};
</script>
