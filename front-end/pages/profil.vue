<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div v-else class="container mx-auto px-4 py-8 min-h-screen">
      <h1 class="text-3xl font-bold mb-8">Profil Utilisateur</h1>
      <UserInfo ref="userInfo" :user="user" :baseUrl="getUrl()" />
      <UserActions :isEditing="isEditing" @editProfile="editProfile" @confirmDelete="confirmDelete"
        @openModal="openModal" />
      <ThemeSettings />
      <EditProfileModal :isOpen="isEditing" :user="user" :baseUrl="getUrl()" @cancelEdit="cancelEdit"
        @saveChanges="saveChanges" />
      <ChangePasswordModal :isOpen="showChangePasswordModal" @close="closeModal" @changePassword="changePassword"
        :regexPassword="regexPassword" />
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
      showChangePasswordModal: false,
      loading: true,
      regexPassword: PASSWORD_REGEX,
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
      const { profile } = payload;

      // helpers locaux
      const isBlank = v => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
      const clean = obj => Object.fromEntries(Object.entries(obj).filter(([_, v]) => !isBlank(v)));
      const norm = x => (typeof x === 'string' ? x.trim() : x);
      const buildPatch = (original, updates) => {
        const c = clean(updates);
        return Object.fromEntries(Object.entries(c).filter(([k, v]) => norm(v) !== norm(original?.[k])));
      };

      // 1) Construire un PATCH minimal depuis le profil (ne JAMAIS hériter de this.user tel quel)
      const patch = buildPatch(this.user, {
        weight: profile.weight,
        tel_num: profile.tel_num,
        tel_medic: profile.tel_medic,
        tel_emergency: profile.tel_emergency,
      });

      const token = localStorage.getItem("accessToken");
      const userId = this.getUserIdFromToken();
      const url = this.getUrl();

      // 2) PATCH user — avatar/licence ne sont plus modifiables ici
      // (réservés à l'administration), seul un JSON simple est envoyé.
      if (patch && Object.keys(patch).length) {
        const res = await fetch(`${url}/users/${userId}`, {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patch),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Échec update profil: ${res.status} ${txt}`);
        }
      }

      // 3) refresh
      await this.fetchUserData();
      // fetchUserData() ne recharge que `user`, pas les licences (endpoint
      // séparé) — et comme user.id ne change pas ici, le watcher de
      // UserInfo ne se redéclenche pas tout seul : on le force explicitement.
      await this.$refs.userInfo?.loadLicenses();
      this.isEditing = false;
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
    },
    async changePassword({ currentPassword, newPassword }) {
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
            currentPassword,
            password: newPassword,
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
