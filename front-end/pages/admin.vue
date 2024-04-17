<template>
  <div class="mb-6">
    <TheSkeleton v-if="loading" />
    <div v-else>
      <div class="container mx-auto py-8">
        <h1 class="text-3xl ml-2 font-semibold mb-4">
          Administration de l'application
        </h1>
        <!-- Inactive Users Table -->
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <inactive-users-table
            :inactive-users="inactiveUsers"
            @reactivate="reactivateUser"
            @delete="deleteUser"
          />
        </div>
        <!-- USERS List -->
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <UserList
            :users="users"
            :sortByList
            @update:users="updateUsers"
            @open-modal="openModal"
          />
        </div>
        <!-- Add Alert Form -->
        <div class="bg-white mx-2 rounded p-2 mb-10">
          <add-alert-form @new-alert="submitAlert" />
        </div>
        <!-- Liste des alertes -->
        <div class="mb-8 bg-white mx-2 rounded p-2 overflow-x-hidden">
          <AlertList :alerts="alerts" @delete-alert="deleteAlert" />
        </div>
        <!-- Create Event Form  -->
        <div class="bg-white mx-2 rounded p-2">
          <create-course-form @create="createCourse" />
        </div>
      </div>

      <!-- Event Table -->
      <div class="mb-8 bg-white mx-2 rounded p-2 overflow-x-auto">
        <event-list
          :events="events"
          @edit-event="editEvent"
          @delete-event="deleteEvent"
        />
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
            :src="selectedUser.avatar"
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
            v-model="selectedUser.name"
            id="username"
          />
        </div>
        <!-- Input Firstname -->
        <div class="mb-2">
          <label for="userfirstname"><strong>Prénom:</strong></label>
          <input
            class="border border-gray-500 p-1"
            type="text"
            v-model="selectedUser.firstname"
            id="userfirstname"
          />
        </div>

        <p class="mb-2"><strong>E-mail:</strong> {{ selectedUser.email }}</p>
        <!-- Birthday -->
        <p class="mb-2">
          <strong>Date de naissance:</strong>
          {{ formatDate(selectedUser.birthday) }}
        </p>
        <!-- Gender -->
        <p class="mb-2">
          <strong>Genre:</strong> {{ selectedUser.gender ? "Homme" : "Femme" }}
        </p>
        <!-- Weight -->
        <p>
          <strong>Poids:</strong>
          {{
            (selectedUser.weight && selectedUser.weight + "Kg") ||
            "Non renseigné"
          }}
        </p>
        <p class="mb-2">
          <strong>Numéro de téléphone:</strong>
          {{
            (selectedUser.tel_num && selectedUser.tel_num) || "Non renseigné"
          }}
        </p>
        <!-- Tel Medic -->
        <p class="mb-2">
          <strong>Téléphone médical:</strong>
          {{
            (selectedUser.tel_medic && selectedUser.tel_medic) ||
            "Non renseigné"
          }}
        </p>
        <!-- Tel emergency -->
        <p class="mb-2">
          <strong>Téléphone d'urgence:</strong>
          {{
            (selectedUser.tel_emergency && selectedUser.tel_emergency) ||
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
      sortByList: [
        { cat: "Nom", value: "name" },
        { cat: "Age", value: "birthday" },
        { cat: "Poids", value: "weight" },
        { cat: "Genre", value: "gender" },
      ],
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
        this.events = response;
      } catch (error) {
        console.error("Erreur lors du chargement des événements", error);
      }
    },
    async createCourse(newCourseData) {
      try {
        newCourseData.places = newCourseData.totalPlaces;
        const duration = newCourseData.duration * 60;
        const url = this.getUrl();
        const token = localStorage.getItem("accessToken");
        // Request Post for create new Event
        const response = await fetch(`${url}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCourseData),
        });

        // Check if the request return status 200 (OK)
        if (response.ok) {
          // Afficher un message de succès
          this.openErrorModal();
          this.errorMessage = "Le cours a été créé avec succès!";
          // Rafraîchir la liste des événements
          this.loadEvents();
        } else {
          // En cas d'erreur
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la création du cours";
        }
      } catch (error) {
        // En cas d'erreur
        this.openErrorModal();
        this.errorMessage = "Erreur lors de la création du cours: " + error;
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
        this.users = response;
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
      // Convertir la chaîne en objet Date
      const date = new Date(dateString);

      // Options de formatage
      const options = {
        weekday: "short", // Utiliser les trois premières lettres du jour
        year: "numeric",
        month: "short", // Utiliser les trois premières lettres du mois
        day: "numeric",
      };

      // Formater la date en utilisant les options
      let formattedDate = date.toLocaleDateString("fr-FR", options);

      // Extraire les deux derniers chiffres de l'année
      const lastTwoDigitsOfYear = formattedDate.slice(-2);

      // Remplacer l'année par les deux derniers chiffres de l'année
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
            name: this.selectedUser.name,
            firstname: this.selectedUser.firstname,
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

        // Check the response and showw error message if it's not ok
        this.openErrorModal();
        (this.errorMessage = "Utilisateur réactivé avec succès :"), response;
        await this.loadInactiveUsers();
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
    updateUsers(sortedUsers) {
      this.users = sortedUsers;
    },
    async submitAlert(newAlertData) {
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
          body: JSON.stringify(newAlertData), // Utiliser les données reçues de l'événement
        });

        if (!response.ok) {
          this.openErrorModal();
          this.errorMessage = "Erreur lors de la création de l'alerte";
        }

        // Afficher un message de succès
        this.openErrorModal();
        this.errorMessage = "L'alerte a été ajoutée !";

        // Mettre à jour les alertes après l'ajout d'une nouvelle alerte
        this.fetchAlerts();
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
