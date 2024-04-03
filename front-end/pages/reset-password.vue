<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser votre mot de passe
        </h2>
      </div>
      <!-- Reset Password Form -->
      <form class="mt-8 space-y-6" @submit.prevent="resetPassword">
        <!-- Input for the rest-Token -->
        <input type="hidden" name="token" v-model="token" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-4">
            <!-- Input for the new password -->
            <inputPassword
              @password="password = $event"
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
          </div>
          <div>
            <!-- Input for the confirmation of the new password have to be === newPassword -->
            <inputPassword
              label="Confirmer votre mot de passe : "
              id="confirmPassword"
              @password="confirmPassword = $event"
              :isValid="validerConfirmPassword"
            />
          </div>
        </div>
        <div>
          <!-- Submit button  -->
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Réinitialiser le mot de passe
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: "", // Rest Token
      password: "", // newPassword
      confirmPassword: "", // Confirmation of the newPassword
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };
  },
  created() {
    // Take the rest Token from the URL
    this.token = this.$route.params.token;
  },
  computed: {
    // Pattern Regex
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
    // ValiderNewPassword
    validerPassword() {
      if (!this.regexPassword.test(this.password)) {
        return false;
      }

      return true;
    },
    // Valider Confirm Password
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
      const regex = /[@$!%*?&]/;
      return regex.test(this.password);
    },
    isNumber() {
      const regex = /[0-9]/;
      return regex.test(this.password);
    },
  },
  methods: {
    // Throw the form at the API for update dataBase
    async resetPassword() {
      const userId = this.getUserIdFromToken();
      if (this.password !== this.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      await useFetch(`http://localhost:8080/users/${userId}`, {
        method: "PATCH",
        mode: "cors",
        body: JSON.stringify(this.user),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    // Get user info from the token
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
  },
};
</script>
