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
        <!-- Input for the reset-Token -->
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
      token: "", // Reset Token
      password: "", // New password
      confirmPassword: "", // Confirmation of the new password
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };
  },
  created() {
    // Take the reset Token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get("token");
  },
  computed: {
    // Pattern Regex
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
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
      const regex = /[@$!%*?&]/;
      return regex.test(this.password);
    },
    isNumber() {
      const regex = /\d/;
      return regex.test(this.password);
    },
  },
  methods: {
    // Submit the form to update the database via API
    async resetPassword() {
      if (this.password !== this.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      // Extract user ID from JWT token
      const userId = this.getUserIdFromToken();
      if (!userId) {
        console.error("Impossible de récupérer l'ID de l'utilisateur.");
        return;
      }

      // Build the PATCH request URL with user ID
      const url = `http://localhost:8080/users/${userId}`;
      

      try {
        // Perform the PATCH request to update user password
        const response = await fetch(url, {
          method: "PATCH",
          mode: "cors",
          body: JSON.stringify({
            currentPassword: process.env.REINITIALIZATIONKEY,
            password: this.password,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        });

        // Check if the request was successful
        if (response.ok) {
          alert("Mot de passe réinitialisé avec succès !");
        } else {
          alert(
            "Une erreur s'est produite lors de la réinitialisation du mot de passe."
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la réinitialisation du mot de passe :",
          error
        );
      }
    },

    // Function to extract user ID from JWT token
    getUserIdFromToken() {
      const token = this.token;
      console.log("Token:", token); // Vérifier le contenu du token
      if (!token) {
        console.error("Aucun token trouvé.");
        return null;
      }

      const tokenParts = token.split(".");
      console.log("Token Parts:", tokenParts); // Vérifier les parties du token
      if (tokenParts.length !== 3) {
        console.error("Le token JWT est invalide.");
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("Payload:", payload); // Vérifier le contenu du payload
      if (!payload || !payload.sub) {
        console.error("Impossible de trouver le champ 'sub' dans le token.");
        return null;
      }

      return payload.sub;
    },
  },
};
</script>
