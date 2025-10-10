<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div v-else class="container mx-auto px-4 py-8 min-h-screen">
      <h1 class="text-3xl font-bold mb-8">Profil Utilisateur</h1>
      <UserInfo :user="user" :baseUrl="getUrl()" />
      <UserActions :isEditing="isEditing" @editProfile="editProfile" @confirmDelete="confirmDelete"
        @openModal="openModal" />
      <EditProfileModal :isOpen="isEditing" :user="user" :baseUrl="getUrl()" @cancelEdit="cancelEdit"
        @saveChanges="saveChanges" />
      <ChangePasswordModal :isOpen="showChangePasswordModal" @close="closeModal" @changePassword="changePassword"
        v-model:currentPassword="currentPassword" v-model:newPassword="newPassword"
        v-model:confirmNewPassword="confirmNewPassword" :regexPassword="regexPassword" />
      <ErrorModal :isOpen="showErrorModal" :message="errorMessage" @close="closeErrorModal" />
      <ConfirmationModal :isOpen="showConfirmationModal" :message="confirmationMessage" @confirm="deleteUser" @cancel="
        () => {
          showConfirmationModal = false;
        }
      " />
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
        license: null,
        gender: null,
        tel_num: null,
        tel_medic: null,
        tel_emergency: null,
        avatar: null,
        password: null,
      },
      isEditing: false,
      avatar: null,
      password: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      showChangePasswordModal: false,
      passwordValidate: false,
      loading: true,
      regexPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      showErrorModal: false,
      errorMessage: null,
      showConfirmationModal: false,
      confirmationMessage: "",
    };
  },
  async mounted() {
    await this.fetchUserData();
    this.checkAccessToken();
  },
  computed: {
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
    validerNewPassword() {
      return this.regexPassword.test(this.newPassword);
    },
    validerConfirmPassword() {
      return this.confirmNewPassword === this.newPassword && this.validerNewPassword;
    },
    isLength() {
      return this.newPassword.length >= 8;
    },
    isMaj() {
      return /[A-Z]/.test(this.newPassword);
    },
    isMin() {
      return /[a-z]/.test(this.newPassword);
    },
    isSpecial() {
      return /[@$!%*?&]/.test(this.newPassword);
    },
    isNumber() {
      return /[0-9]/.test(this.newPassword);
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
        document.location.href = "/";
        return;
      }
      const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
      const expirationDate = new Date(decodedToken.exp * 1000);
      if (expirationDate < new Date()) {
        localStorage.removeItem("accessToken");
        document.location.href = "/";
      }
    },
    getUserIdFromToken() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Aucun token trouvé dans le localStorage.");
        return null;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload || !payload.sub) {
        console.error('Impossible de trouver le champ "sub" dans le token.');
        return null;
      }
      return payload.sub;
    },
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
    editProfile() {
      this.isEditing = true;
    },
    async saveChanges(payload) {
      const { profile, licenses } = payload;

      // 1) PATCH user (sans le champ license)
      const formData = new FormData();
      formData.append("user", JSON.stringify({
        password: null,
        name: null,
        firstname: null,
        date_end_pay: null,
        date_payment: null,
        weight: profile.weight,
        tel_num: profile.tel_num,
        tel_medic: profile.tel_medic,
        tel_emergency: profile.tel_emergency,
      }));
      if (profile.avatar) formData.append("file", profile.avatar);

      const token = localStorage.getItem("accessToken");
      const userId = this.getUserIdFromToken();
      const url = this.getUrl();

      await fetch(`${url}/users/${userId}`, {
        method: "PATCH",
        mode: "cors",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2) Upsert licences
      for (const lic of (licenses || [])) {
        await fetch(`${url}/users/${userId}/licenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(lic), // { federationCode, number }
        });
      }

      // refresh simple
      document.location.href = "/profil";
    },

    cancelEdit() {
      this.isEditing = false;
    },
    confirmDelete() {
      this.confirmationMessage = "Êtes-vous sûr de vouloir supprimer votre compte ?";
      this.showConfirmationModal = true;
    },
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
        this.$router.push("/");
      } catch (error) {
        this.openErrorModal();
        this.errorMessage = "Erreur lors de la suppression de l'utilisateur";
      }
    },
    openModal() {
      this.showChangePasswordModal = true;
    },
    closeModal() {
      this.showChangePasswordModal = false;
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = "";
    },
    async changePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.openErrorModal();
        this.errorMessage = "Les nouveaux mots de passe ne correspondent pas.";
        return;
      }
      try {
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
    closeErrorModal() {
      this.showErrorModal = false;
      this.errorMessage = "";
    },
  },
};
</script>
