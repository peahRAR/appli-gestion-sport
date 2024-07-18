<template>
  <div>
    <!-- Login Form -->
    <form @submit.prevent="signIn">
      <!-- Email input -->
      <div class="mb-4">
        <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email :</label>
        <input v-model="user.email" @input="user.email = $event.target.value.toLowerCase()" type="email" id="email"
          name="email" placeholder="Votre email" class="w-full px-4 py-2 border rounded-lg focus:outline-none"
          autocomplete="email" />
      </div>
      <!-- Password input -->
      <div class="mb-6">
        <inputPassword v-model="user.password" :regex="regexPassword" label="Mot de passe : " id="password"
          :isValid="null" autocomplete="current-password" />
      </div>
      <!-- Afficher le message d'erreur s'il y a lieu -->
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">
        {{ errorMessage }}
      </p>
      <!-- Submit Button -->
      <div class="flex justify-center">
        <button type="submit"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Se connecter
        </button>
      </div>
    </form>

    <div class="flex justify-center items-center">
      <!-- Button to open modal -->
      <button @click="openResetPasswordModal"
        class="mt-2 underline bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Réinitialiser le mot de passe
      </button>
    </div>

    <!-- Reset Password Modal -->
    <TheModal :isOpen="showResetPasswordModal" title="Réinitialiser le mot de passe" @close="closeResetPasswordModal">
      <form @submit.prevent="requestPasswordReset">
        <div class="mb-4">
          <label for="resetEmail" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="resetEmail" type="email" id="resetEmail" name="resetEmail" placeholder="Votre email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400" />
        </div>
        <div class="flex justify-center items-center">
          <button type="submit"
            class="bg-green-500 ml-24 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Envoyer
          </button>
        </div>
      </form>
    </TheModal>

    <!-- Error Modal -->
    <TheModal :isOpen="showErrorModal" title="Message" @close="closeErrorModal">
      {{ errorMessage }}
    </TheModal>
  </div>
</template>

<script>
export default {
  name: "TheLogin",
  data() {
    return {
      user: {
        email: null, //Variable keep email
        password: "", // Variable keep password
      },
      showErrorModal: false,
      showResetPasswordModal: false,
      errorMessage: null,
      resetEmail: "",
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };
  },
  computed: {
    // Pattern Regex
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
  },

  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    // LOGIN API method
    async signIn() {
      const url = this.getUrl();
      try {
        const { data } = await useFetch(`${url}/auth/login`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(this.user),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Keep AccesToken in localStorage

        if (data && data.value) {
          localStorage.setItem("accessToken", data.value.access_token);
          document.location.href = "/";
        } else {
          this.openErrorModal();
          this.errorMessage =
            "Erreur lors de la connexion, mot de passe ou email incorrect";
        }
      } catch (error) {
        // Catch if some error was raised
        console.error("Erreur lors de la connexion :", error);
        // Afficher un message d'erreur générique en cas d'erreur
        this.openErrorModal();
        this.errorMessage =
          "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
        // Afficher un message d'erreur si le token d'accès n'est pas trouvé dans la réponse
        this.openErrorModal();
        this.errorMessage = "Email ou mot de passe invalide.";
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
    // Open modal to reset password
    openResetPasswordModal() {
      this.showResetPasswordModal = true;
    },

    // Close reset password modal
    closeResetPasswordModal() {
      this.showResetPasswordModal = false;
      this.resetEmail = "";
    },

    // Request password reset
    async requestPasswordReset() {
      const url = this.getUrl();
      try {
        const response = await fetch(`${url}/auth/resetpassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: this.resetEmail }),
        });

        if (response.ok) {
          // La requête a réussi
          // Vous pouvez gérer le succès ici, par exemple en affichant un message à l'utilisateur
          this.openErrorModal();
          this.errorMessage =
            "Demande de réinitialisation du mot de passe envoyée avec succès";
          this.showResetPasswordModal = false;
        } else {
          // La requête a échoué
          // Vous pouvez gérer l'échec ici, par exemple en affichant un message d'erreur à l'utilisateur
          this.openErrorModal();
          (this.errorMessage =
            "Échec de la demande de réinitialisation du mot de passe :"),
            response.status;
          this.showResetPasswordModal = false;
          throw new Error(
            "Échec de la demande de réinitialisation du mot de passe"
          );
        }
      } catch (error) {
        // Une erreur s'est produite lors de l'envoi de la requête
        // Vous pouvez gérer l'erreur ici, par exemple en affichant un message d'erreur à l'utilisateur
        console.error(
          "Erreur lors de la demande de réinitialisation du mot de passe :",
          error
        );
        this.openErrorModal();
        this.errorMessage =
          "Erreur lors de la demande de réinitialisation du mot de passe";
        this.showResetPasswordModal = false;
      }
    },
  },
};
</script>
