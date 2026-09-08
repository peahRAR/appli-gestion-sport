<template>
  <div
    class="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-text">
          Réinitialiser votre mot de passe
        </h2>
      </div>

      <!-- Vérification du lien en cours -->
      <p v-if="tokenState === 'checking'" class="text-center text-text-muted">
        Vérification du lien…
      </p>

      <!-- Lien expiré / invalide / déjà utilisé -->
      <div v-else-if="tokenState === 'error'" class="text-center space-y-4">
        <p class="text-text">{{ tokenErrorMessage }}</p>
        <NuxtLink
          to="/?resetPassword=1"
          class="inline-block py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Mot de passe oublié
        </NuxtLink>
      </div>

      <!-- Reset Password Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="resetPassword">
        <!-- Input for the reset-Token -->
        <input type="hidden" name="token" v-model="token" />
        <div class="rounded-md shadow-xs -space-y-px">
          <div class="mb-4">
            <!-- Input for the new password -->
            <inputPassword
              v-model="password"
              :regex="regexPassword"
              label="Nouveau mot de passe : "
              id="password"
              :isValid="validerPassword"
            />
            <!-- Afficher un message d'erreur si le mot de passe ne respecte pas les critères  -->
            <check-password
              :isLength="isLength"
              :isSpecial="isSpecial"
              :isMaj="isMaj"
              :isMin="isMin"
              :isNumber="isNumber"
            />
            <p class="mt-1 text-xs text-text-muted">{{ passwordRuleMessage }}</p>
          </div>
          <div>
            <!-- Input for the confirmation of the new password have to be === newPassword -->
            <inputPassword
              label="Confirmer votre mot de passe : "
              id="confirmPassword"
              v-model="confirmPassword"
              :isValid="validerConfirmPassword"
            />
          </div>
        </div>
        <div>
          <!-- Submit button  -->
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Réinitialiser le mot de passe
          </button>
        </div>
      </form>
    </div>
    <TheModal
      :isOpen="showErrorModal"
      title="Message"
      @close="closeErrorModal"
      >{{ this.errorMessage }}</TheModal
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: "", // Reset Token
      password: "", // New password
      confirmPassword: "", // Confirmation of the new password
      regexPassword: PASSWORD_REGEX,
      passwordRuleMessage: PASSWORD_RULE_MESSAGE,
      showErrorModal: false,
      errorMessage: null,
      // 'checking' | 'valid' | 'error'
      tokenState: "checking",
      tokenErrorMessage: "",
    };
  },
  async created() {
    // Take the reset Token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get("token");
    await this.checkTokenValidity();
  },
  computed: {
    // Validate New Password
    validerPassword() {
      return this.regexPassword.test(this.password);
    },
    // Validate Confirm Password
    validerConfirmPassword() {
      return this.confirmPassword === this.password;
    },
    isLength() {
      return this.password.length >= 8;
    },
    isMaj() {
      const regex = /[A-Z]/;
      return regex.test(this.password);
    },
    isMin() {
      const regex = /[a-z]/;
      return regex.test(this.password);
    },
    isSpecial() {
      return [...this.password].some((ch) => PASSWORD_SPECIAL_CHARS.includes(ch));
    },
    isNumber() {
      const regex = /\d/;
      return regex.test(this.password);
    },
  },
  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    // Checked once on page load, so the user finds out the link is
    // expired/invalid before typing a new password.
    async checkTokenValidity() {
      if (!this.token) {
        this.tokenState = "error";
        this.tokenErrorMessage = "Ce lien de réinitialisation est invalide.";
        return;
      }
      try {
        const url = this.getUrl();
        const response = await fetch(
          `${url}/users/reset-password/validate?token=${encodeURIComponent(this.token)}`
        );
        if (response.ok) {
          this.tokenState = "valid";
          return;
        }
        const body = await response.json().catch(() => ({}));
        this.tokenState = "error";
        this.tokenErrorMessage =
          body?.message || "Ce lien de réinitialisation est invalide.";
      } catch (error) {
        console.error("Erreur lors de la vérification du lien :", error);
        this.tokenState = "error";
        this.tokenErrorMessage =
          "Impossible de vérifier ce lien pour le moment. Veuillez réessayer.";
      }
    },
    // Submit the form to update the database via API
    async resetPassword() {
      if (this.password !== this.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }
      if (!this.validerPassword) {
        alert(this.passwordRuleMessage);
        return;
      }

      const url = this.getUrl();

      try {
        // Perform the PATCH request to update user password
        const response = await fetch(`${url}/users/reset-password`, {
          method: "PATCH",
          mode: "cors",
          body: JSON.stringify({
            token: this.token,
            newPassword: this.password,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if the request was successful
        if (response.ok) {
          this.openErrorModal();
          this.errorMessage = "Mot de passe réinitialisé avec succès !";
        } else {
          // The token may have expired between page load and submit —
          // switch to the same dedicated error state rather than a generic alert.
          const body = await response.json().catch(() => ({}));
          this.tokenState = "error";
          this.tokenErrorMessage =
            body?.message ||
            "Une erreur s'est produite lors de la réinitialisation du mot de passe.";
        }
      } catch (error) {
        console.error(
          "Erreur lors de la réinitialisation du mot de passe :",
          error
        );
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
