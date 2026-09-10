<template>
  <div>
    <!-- Login Form -->
    <form @submit.prevent="signIn">
      <!-- Email input -->
      <div class="mb-4">
        <label for="email" class="block text-text-muted text-sm font-bold mb-2">Email :</label>
        <input v-model="user.email" @input="user.email = $event.target.value.toLowerCase()" type="email" id="email"
          name="email" placeholder="Votre email" class="w-full px-4 py-2 border rounded-lg bg-surface text-text focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
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
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-sm focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
          Se connecter
        </button>
      </div>
    </form>

    <div class="flex justify-center items-center">
      <!-- Button to open modal -->
      <button @click="openResetPasswordModal"
        class="mt-2 underline bg-bg hover:bg-surface-2 text-text text-sm font-bold py-2 px-4 rounded-sm focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
        Réinitialiser le mot de passe
      </button>
    </div>

    <!-- Ajout à l'écran d'accueil : masqué si déjà installée, sinon un vrai
         bouton d'installation sur Android/desktop (beforeinstallprompt), ou
         des instructions manuelles sur iPhone (Apple n'expose aucune API
         pour déclencher l'installation depuis le site). -->
    <div v-if="showInstallButton" class="flex justify-center items-center">
      <button @click="onInstallClick" type="button"
        class="mt-4 inline-flex items-center gap-2 bg-surface-2 hover:bg-bg text-text text-sm font-bold py-2 px-4 rounded-sm border border-border-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 3v10.59l3.29-3.3L16.7 11.7L12 16.4l-4.7-4.7l1.41-1.41l3.29 3.3V3zM5 19h14v2H5z" />
        </svg>
        Ajouter à l'écran d'accueil
      </button>
    </div>

    <!-- Instructions manuelles (iPhone) -->
    <TheModal :isOpen="showInstallHelpModal" title="Ajouter à l'écran d'accueil" @close="showInstallHelpModal = false">
      <p v-if="!isIosSafari" class="mb-3">
        Sur iPhone, l'ajout à l'écran d'accueil n'est possible que depuis <strong>Safari</strong>.
        Ouvre ce site dans Safari, puis suis les étapes ci-dessous.
      </p>
      <ol class="list-decimal list-inside space-y-2">
        <li>Appuie sur le bouton <strong>Partager</strong> <span aria-hidden="true">(⬆️, en bas de Safari)</span></li>
        <li>Fais défiler et sélectionne <strong>"Sur l'écran d'accueil"</strong></li>
        <li>Confirme en appuyant sur <strong>"Ajouter"</strong></li>
      </ol>
    </TheModal>

    <!-- Reset Password Modal -->
    <TheModal :isOpen="showResetPasswordModal" title="Réinitialiser le mot de passe" @close="closeResetPasswordModal">
      <form @submit.prevent="requestPasswordReset">
        <div class="mb-4">
          <label for="resetEmail" class="block text-text-muted text-sm font-bold mb-2">Email</label>
          <input v-model="resetEmail" type="email" id="resetEmail" name="resetEmail" placeholder="Votre email"
            class="w-full px-4 py-2 border rounded-lg bg-surface text-text focus:border-blue-400 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" />
        </div>
        <div class="flex justify-center items-center">
          <button type="submit"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-sm focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
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
      showInstallHelpModal: false,
      errorMessage: null,
      resetEmail: "",
      isIos: false,
      isIosSafari: false,
      isStandalone: false,
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };
  },
  created() {
    // Lien direct depuis un message "lien de réinitialisation expiré/invalide"
    if (this.$route?.query?.resetPassword) {
      this.showResetPasswordModal = true;
    }
  },
  mounted() {
    const ua = window.navigator.userAgent || "";
    this.isIos = /iP(hone|od|ad)/.test(ua);
    // Chrome/Firefox sur iOS utilisent bien le moteur WebKit mais leur menu
    // de partage n'installe pas toujours une vraie PWA en mode standalone —
    // on ne peut compter que sur Safari pour ça.
    this.isIosSafari = this.isIos && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    this.isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  },
  computed: {
    showInstallButton() {
      if (this.isStandalone) return false;
      return this.isIos || !!this.$pwa?.showInstallPrompt;
    },
  },
  methods: {
    async onInstallClick() {
      if (this.isIos) {
        this.showInstallHelpModal = true;
        return;
      }
      await this.$pwa?.install();
    },
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
