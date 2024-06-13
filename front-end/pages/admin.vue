<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div v-else>
      <div class="container mx-auto py-8">
        <h1 class="text-3xl ml-2 font-semibold mb-4">
          Administration
        </h1>
        <!-- Inactive Users Table -->
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <inactive-users-table :inactive-users="filterUsers(false)" :pageSize="10" @reactivate="reactivateUser"
            @delete="deleteUser" />
        </div>
        <!-- USERS List -->
        <div class="mb-8 bg-white mx-2 rounded p-2" style="overflow-x: auto">
          <UserList :users="preprocessUsers(filterUsers(true))" :sortByList :filterList :activeColumns :defaultColumns
            :columnsNames @update:users="updateUsers" @open-modal="openModal" />
        </div>
        <!-- Ajouté une alerte -->
        <div class="bg-white mx-2 rounded p-2 mb-10">
          <add-alert-form @new-alert="submitAlert" />
        </div>
        <!-- Liste des alertes -->
        <div class="mb-8 bg-white mx-2 rounded p-2 overflow-x-hidden">
          <AlertList :alerts="alerts" @delete-alert="deleteAlert" />
        </div>
        <!-- Creer un cour  -->
        <div class="bg-white mx-2 rounded p-2">
          <create-course-form @create="createCourse" />
        </div>

        <!-- Liste des cours -->
        <div class="mt-8 bg-white mx-2 rounded p-2 overflow-x-auto">
          <event-list :events="events" @edit-event="editEvent" @delete-event="deleteEvent" />
        </div>
      </div>

      <EditUserModal :isOpen="showModalSelectedUser" :user="selectedUser" @close="closeModalUser"
        @update-user="updateUser" @delete-user="deleteUser" @change-role="changeUserRole" />

      <!-- Modal For Editing Event -->
      <EditEventModal :isOpen="showModal" :event="editedEvent" @close="closeModal" @save-changes="saveChanges" />

      <TheModal :isOpen="showErrorModal" title="Message" @close="closeErrorModal">{{ this.errorMessage }}</TheModal>
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
        { cat: "Prénom", value: "firstname" },
        { cat: "Age", value: "birthday" },
        { cat: "Poids", value: "weight" },
        
      ],
      filterList: [
        { filter: "Filtrer par ...", value: "all" },
        { filter: "Hommes", value: "homme" },
        { filter: "Femmes", value: "femme" },
        {filter: "Date de fin de paiement", value:"dateEndPay"},
      ],
      activeColumns: ["name", "firstname"],
      defaultColumns: ["name", "firstname"],
      columnsNames: { name: "Nom", firstname: "Prénom", birthday: "Age", weight: "Poids" },
    };
  },
  async mounted() {
    // Get The element from the Api At the composant Mounted
    await this.checkUserRole(); // check UserRole
    await this.loadEvents(); // Events
    await this.loadAllUsers(); // Users
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
     preprocessUsers(users) {
      return users.map((user) => ({
        ...user,
        weight: user.weight ? `${user.weight} Kg` : "-",
        birthday: this.calculateAge(user.birthday),
      }));
    },
    calculateAge(birthday) {
      const birthdate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const m = today.getMonth() - birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      return age;
    },
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
    async createCourse(newCourseData) {
      try {
        newCourseData.places = newCourseData.totalPlaces;
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
    async loadAllUsers() {
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
        this.loading = false
        // Keep all in Users Array
        this.users = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs", error);
      }

    },
    filterUsers(isActive) {
      // Covert the respons in JSON
          const allUsers = this.users;
          // Filter Users
          const users = allUsers.filter(
            (user) => user.isActive === isActive
      );

      return users
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
        this.loadAllUsers();
        this.closeModal();
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la mise à jour de l'utilisateur"),
          error;
        // Show error message if it not in status 200
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
        (this.errorMessage = "Utilisateur réactivé avec succès"), response;
        await this.loadAllUsers();
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
          this.loadAllUsers();
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
    async changeUserRole(userId, newRole) {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Extract the Role of current user from the token payload
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            if (payload.role === 2) {
              const url = this.getUrl();
              const response = await fetch(`${url}/admin/${userId}/${newRole}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              let responseData = null;

              if (response.ok) {
                // Only attempt to parse JSON if there is a body
                const text = await response.text();
                responseData = text ? JSON.parse(text) : {};

                console.log("Réponse de l'API :", responseData); // Log response data
                this.openErrorModal();
                this.errorMessage = "Le rôle de l'utilisateur a été modifié avec succès";
                this.loadAllUsers(); // Corrected typo from loadAllUSers to loadAllUsers
                this.closeModalUser(); // Corrected typo from closeModal to closeModalUser
              } else {
                // Only attempt to parse JSON if there is a body
                const text = await response.text();
                responseData = text ? JSON.parse(text) : {};

                console.error("Erreur lors de la réponse de l'API :", responseData); // Log response data on error
                this.openErrorModal();
                this.errorMessage = "Erreur lors de la modification du rôle de l'utilisateur";
              }
            } else {
              this.openErrorModal();
              this.errorMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action";
            }
          } else {
            throw new Error("Token JWT invalide");
          }
        } else {
          throw new Error("Token JWT introuvable dans le localStorage");
        }
      } catch (error) {
        console.error("Erreur :", error); // Log the error
        this.openErrorModal();
        this.errorMessage = "Erreur lors de la modification du rôle de l'utilisateur ";
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
    async saveChanges(eventId, updatedEvent) {
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
            body: JSON.stringify(updatedEvent),
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
