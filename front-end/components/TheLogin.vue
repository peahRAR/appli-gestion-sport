<template>
  <div>
    <!-- Login Form -->
    <form @submit.prevent="signIn">
      <!-- Email input -->
      <div class="mb-4">
        <label for="email" class="block text-gray-700 text-sm font-bold mb-2"
          >Email</label
        >
        <input
          v-model="user.email"
          type="email"
          id="email"
          name="email"
          placeholder="Votre email"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
        />
      </div>
      <!-- Password input -->
      <div class="mb-6">
        <inputPassword @password="user.password = $event" :regex='regexPassword' label="Mot de passe : "
                id="password" :isValid="validerPassword" />
      </div>
      <!-- Afficher le message d'erreur s'il y a lieu -->
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">
        {{ errorMessage }}
      </p>
      <!-- Submit Button -->
      <div class="flex justify-center">
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Se connecter
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "TheLogin",
  data() {
    return {
      user: {
        email: null, //Variable keep email
        password: null, // Variable keep password
      },
      errorMessage: null, // Variable keep error message
      regexPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };
  },
  computed: {
        // Pattern Regex
        patternRegex() {
            return this.regexPassword.toString().slice(1, -1)
        },
        // ValiderPassword
        validerPassword() {
            if (!this.regexPassword.test(this.user.password)) {

                return false
            }

            return true
        },
    },

  methods: {
    // LOGIN API method
    async signIn() {
      try {
        console.log(this.user);
        const { data } = await useFetch("http://localhost:8080/auth/login", {
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
          console.error(
            "Erreur lors de la connexion : données non définies ou incorrectes"
          );
        }
    
      } catch (error) {
        // Catch if some error was raised
        console.error("Erreur lors de la connexion :", error);
        // Afficher un message d'erreur générique en cas d'erreur
        this.errorMessage =
          "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
        // Afficher un message d'erreur si le token d'accès n'est pas trouvé dans la réponse
        this.errorMessage = "Email ou mot de passe invalide.";
      }
    },
  },
};
</script>
