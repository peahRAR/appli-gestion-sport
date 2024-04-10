<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div v-else class="container mx-auto px-4 py-8 min-h-screen">
      <h1 class="text-3xl font-bold mb-8">Profil Utilisateur</h1>
      <!-- User Profil Infos -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div class="col-span-2">
            <!-- Avatar -->
            <NuxtImg
              v-if="user.avatar"
              :src="user.avatar.data"
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
            <!-- Name -->
            <p class="text-gray-600 mb-2 capitalize">
              <strong>Nom:</strong>
              {{
                user.name && user.name.data ? user.name.data : "Non Renseigné"
              }}
            </p>
            <!-- FirstName -->
            <p class="text-gray-600 mb-2 capitalize">
              <strong>Prénom:</strong>
              {{
                user.firstname && user.firstname.data
                  ? user.firstname.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Email -->
            <p class="text-gray-600 mb-2">
              <strong>Email:</strong>
              {{
                user.email && user.email.data
                  ? user.email.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Weight -->
            <p class="text-gray-600 mb-2">
              <strong>Poids:</strong>
              {{
                user.weight && user.weight.data
                  ? user.weight.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Licence -->
            <p class="text-gray-600 mb-2">
              <strong>Licence:</strong>
              {{
                user.licence && user.licence.data
                  ? user.licence.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Gender -->
            <p class="text-gray-600 mb-2">
              <strong>Genre:</strong> {{ user.gender ? "Homme" : "Femme" }}
            </p>
            <!-- Tel Medic -->
            <p class="text-gray-600 mb-2">
              <strong>Téléphone Médical:</strong>
              {{
                user.tel_medic && user.tel_medic.data
                  ? user.tel_medic.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Tel Emergency -->
            <p class="text-gray-600 mb-2">
              <strong>Téléphone d'urgence:</strong>
              {{
                user.tel_emergency && user.tel_emergency.data
                  ? user.tel_emergency.data
                  : "Non Renseigné"
              }}
            </p>
            <!-- Date Fin de paiment -->
            <p class="text-gray-600 mb-2">
              <strong>Date fin de paiment:</strong>
              {{
                user.date_End_Pay && user.date_End_Pay.data
                  ? user.date_End_Pay.data
                  : "Non Renseigné"
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <!-- Button Edit Profil -->
        <button
          @click="editProfile"
          v-if="!isEditing"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Modifier le profil
        </button>
        <!-- Button open password change -->
        <button
          @click="openModal"
          class="bg-yellow-500 w-full hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Changer le mot de passe
        </button>
        <!-- Button Delete Profil -->
        <button
          @click="confirmDelete"
          v-if="!isEditing"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Supprimer le compte
        </button>
      </div>
      <!-- Modal Edit Profil -->
      <TheModal
        :isOpen="isEditing"
        title="Changement de vos informations"
        @close="cancelEdit"
      >
        <!-- Modal Content -->
        <!-- Avatar -->
        <p>Avatar:</p>
        <TheAvatar @avatarSaved="avatar = $event" class="mb-4" />
        <!-- Weight -->
        <p>Poids:</p>
        <input
          type="text"
          v-model="editedWeight"
          placeholder="Nouveau poids"
          class="input-field mb-4"
        />
        <!-- Licence -->
        <p>Licence:</p>
        <input
          type="text"
          v-model="editedLicence"
          placeholder="Nouvelle licence"
          class="input-field mb-4"
        />
        <!-- Tel Medic -->
        <p>Téléphone médicale:</p>
        <input
          type="text"
          v-model="editedTelMedic"
          placeholder="Nouveau téléphone médical"
          class="input-field mb-4"
        />
        <!-- Tel Emergency -->
        <p>Téléphone d'urgence:</p>
        <input
          type="text"
          v-model="editedTelEmergency"
          placeholder="Nouveau téléphone d'urgence"
          class="input-field mb-4"
        />

        <div class="flex justify-center space-x-4">
          <!-- Button For saving changes -->
          <button
            @click="saveChanges"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 text-center rounded mt-4"
          >
            Enregistrer les modifications
          </button>
        </div>
      </TheModal>
      <TheModal
        :isOpen="showChangePasswordModal"
        title="Changement du mot de passe"
        @close="closeModal"
      >
        <!-- Contenu de la modale -->
        <!-- Modal de changement de mot de passe -->
        <form @submit.prevent="changePassword" method="post">
          <div class="mb-4">
            <inputPassword
              v-model="currentPassword"
              label="Mot de passe actuel : "
              id="currentPassword"
              :isValid="null"
            />
          </div>
          <div class="mb-4">
            <inputPassword
              v-model="newPassword"
              :regex="regexPassword"
              label="Nouveau mot de passe : "
              id="newPassword"
              :isValid="validerNewPassword"
            />

            <!-- Afficher un message d'erreur si le mot de passe ne respecte pas les critères  -->
            <check-password
              :isLength="isLength"
              :isSpecial="isSpecial"
              :isMaj="isMaj"
              :isMin="isMin"
              :isNumber="isNumber"
            />
          </div>
          <div class="mb-4">
            <inputPassword
              label="Confirmer votre mot de passe : "
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              :isValid="validerConfirmPassword"
            />
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Changer
            </button>
          </div>
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
      user: {
        name: null,
        firstname: null,
        date_Subscribe: null,
        email: null,
        weight: null,
        licence: null,
        gender: null,
        tel_medic: null,
        tel_emergency: null,
        avatar: null,
        password: null,
      },
      isEditing: false, // If the editing modal true
      editedName: null,
      editedEmail: null,
      editedWeight: null,
      editedLicence: null,
      editedGender: null,
      editedTelMedic: null,
      editedTelEmergency: null,
      avatar: null,
      password: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      showChangePasswordModal: false,
      passwordValidate: false,
      loading: true,
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      showErrorModal: false,
      errorMessage: null,
    };
  },
  async mounted() {
    // Keep the userData when the component is mount
    await this.fetchUserData();
    this.checkAccessToken();
  },
  computed: {
    // Pattern Regex
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
    // ValiderNewPassword
    validerNewPassword() {
      if (!this.regexPassword.test(this.newPassword)) {
        return false;
      }

      return true;
    },
    // Valider Confirm Password
    validerConfirmPassword() {
      if (this.confirmNewPassword === this.newPassword) {
        return true;
      }
      return false;
    },
    isLength() {
      return this.newPassword.length >= 8;
    },
    isMaj() {
      const regex = /[A-Z]/;
      return regex.test(this.newPassword);
    },
    isMin() {
      const regex = /[a-z]/;
      return regex.test(this.newPassword);
    },
    isSpecial() {
      const regex = /[@$!%*?&]/;
      return regex.test(this.newPassword);
    },
    isNumber() {
      const regex = /[0-9]/;
      return regex.test(this.newPassword);
    },
  },
  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    checkAccessToken() {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        // Redirection vers la page d'accueil si aucun accessToken n'est présent
        document.location.href = "/";
        return;
      } else if (accessToken) {
        // Décodez le token pour obtenir la date d'expiration
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        const expirationDate = new Date(decodedToken.exp * 1000); // Convertir la date d'expiration en millisecondes

        // Vérifiez si la date d'expiration est dépassée
        if (expirationDate < new Date()) {
          localStorage.removeItem("accessToken");
          document.location.href = "/";
        }
      }
    },
    // Keep the user infos from the token
    getUserIdFromToken() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Aucun token trouvé dans le localStorage.");
        return null;
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Le token JWT est invalide.");
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload || !payload.sub) {
        console.error('Impossible de trouver le champ "sub" dans le token.');
        return null;
      }

      return payload.sub;
    },
    // Keep the user infos
    async fetchUserData() {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = this.getUserIdFromToken();
        const url = this.getUrl();
        if (!userId) {
          console.error("Impossible de récupérer l'ID de l'utilisateur.");
          return;
        }
        const response = await fetch(`${url}/users/${userId}`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        this.user = data;
        this.loading = false;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations utilisateur",
          error
        );
      }
    },
    // Editing profil
    editProfile() {
      this.isEditing = true;
      // Initialiser les champs d'entrée avec les valeurs actuelles de l'utilisateur
      this.editedWeight = this.user.weight ? this.user.weight.data : null;
      this.editedLicence = this.user.licence ? this.user.licence.data : null;
      this.editedTelMedic = this.user.tel_medic
        ? this.user.tel_medic.data
        : null;
      this.editedTelEmergency = this.user.tel_emergency
        ? this.user.tel_emergency.data
        : null;
    },
    // Api request for update user data
    async saveChanges() {
      const formData = new FormData();
      formData.append(
        "user",
        JSON.stringify({
          password: null,
          name: null,
          firstname: null,
          date_end_pay: null,
          date_payment: null,
          weight: this.editedWeight,
          licence: this.editedLicence,
          tel_medic: this.editedTelMedic,
          tel_emergency: this.editedTelEmergency,
        })
      );
      formData.append("file", this.avatar);
      for (const value of formData.values()) {
        console.log(value);
      }

      try {
        const token = localStorage.getItem("accessToken");
        const userId = this.getUserIdFromToken();
        const url = this.getUrl();
        if (!userId) {
          console.error("Impossible de récupérer l'ID de l'utilisateur.");
          return;
        }

        await fetch(`${url}/users/${userId}`, {
          method: "PATCH",
          mode: "cors",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.isEditing = false;
        this.editedName = null;
        this.editedEmail = null;
        this.editedWeight = null;
        this.editedLicence = null;
        this.editedGender = null;
        this.editedTelMedic = null;
        this.editedTelEmergency = null;
        this.avatar = null;

        document.location.href = "/profil";
      } catch (error) {
        this.openErrorModal();
        this.errorMessage = "Erreur lors de la sauvegarde des modifications";
      }
    },
    // Close modal
    cancelEdit() {
      this.isEditing = false;
    },
    // Confirm Deletion
    confirmDelete() {
      if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
        this.deleteUser();
      }
    },
    // Request for delete user
    async deleteUser() {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = this.getUserIdFromToken();
        const url = this.getUrl();
        if (!userId) {
          console.error("Impossible de récupérer l'ID de l'utilisateur.");
          return;
        }
        await fetch(`${url}/users/${userId}`, {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.removeItem("accessToken");
        // Rediriger l'utilisateur vers la page d'accueil après la suppression si nécessaire
        this.$router.push("/");
      } catch (error) {
        this.openErrorModal();
        this.errorMessage = "Erreur lors de la suppression de l'utilisateur";
      }
    },
    // Open modal Password change
    openModal() {
      this.showChangePasswordModal = true;
    },
    //  Close Modal Password change
    closeModal() {
      this.showChangePasswordModal = false;
      // Réinitialiser les champs de mot de passe lorsque la modal est fermée
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = "";
    },
    // Update the user passswors api Key
    async changePassword() {
      // Vérifier si les nouveaux mots de passe correspondent
      if (this.newPassword !== this.confirmNewPassword) {
        this.openErrorModal();
        this.errorMessage = "Les nouveaux mots de passe ne correspondent pas.";
        return;
      }

      try {
        // Envoyer une requête au serveur pour changer le mot de passe
        const token = localStorage.getItem("accessToken");
        const userId = this.getUserIdFromToken();
        const url = this.getUrl();
        if (!userId) {
          console.error("Impossible de récupérer l'ID de l'utilisateur.");
          return;
        }
        const response = await fetch(`${url}/users/${userId}`, {
          method: "PATCH",
          mode: "cors",
          body: JSON.stringify({
            currentPassword: this.currentPassword,
            password: this.newPassword,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          this.openErrorModal();
          this.errorMessage = "Mot de passe changé avec succès.";
          this.closeModal();
        } else {
          const errorMessage = await response.text();
          alert(`Erreur lors du changement de mot de passe : ${errorMessage}`);
        }
      } catch (error) {
        console.error("Erreur lors du changement de mot de passe", error);
        alert("Erreur lors du changement de mot de passe. Veuillez réessayer.");
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
  },
};
</script>

<style>
.input-field {
  border: 1px solid #e2e8f0;
  padding: 8px;
  width: 100%;
}
</style>
