<template>
  <div class="flex justify-between items-center p-2 bg-white text-white border-b-2 border-gray-400">
    <nuxt-picture src="MMABsxLogo.png" alt="MMA Baisieux" class="text-2xl text-black font-bold h-16 w-16" />

    <div v-if="isAuthenticated">
      <!-- Menu déroulant -->
      <div class="relative">
        <button @click="toggleMenu" class="flex items-center">
          <!-- Icône de menu (à remplacer par votre propre icône) -->
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24">
            <path fill="bg-black"
              d="M19 18v-4h-2v4h-2l3 3l3-3zM11 4C8.8 4 7 5.8 7 8s1.8 4 4 4s4-1.8 4-4s-1.8-4-4-4m0 10c-4.4 0-8 1.8-8 4v2h9.5c-.3-.8-.5-1.6-.5-2.5c0-1.2.3-2.3.9-3.4c-.6 0-1.2-.1-1.9-.1" />
          </svg>
        </button>
        <!-- Contenu du menu déroulant -->
        <div v-show="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <NuxtLink class="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer" to="/profil"
            @click="toggleMenu">
            Profil
          </NuxtLink>
          <NuxtLink class="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer" to="/" @click="toggleMenu">
            Accueil
          </NuxtLink>
          <!-- Affichage de la page d'administration pour les utilisateurs avec un rôle spécifique -->
          <div v-if="userRole === 1 || userRole === 2">
            <NuxtLink class="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer" to="/admin"
              @click="toggleMenu">
              Administration
            </NuxtLink>
          </div>
          <button @click="logout" class="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer">
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      isAuthenticated: false,
      userRole: 0,
      isMenuOpen: false,
    };
  },
  created() {
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        console.log(accessToken);
        console.log(typeof (accessToken));

        // Puisque `null` et la chaîne vide sont tous les deux falsy, 
        // cette vérification empêche d'entrer dans le bloc si `accessToken` n'est pas valide
        if (accessToken) {
          console.log("coucou");

          // La chaîne n'est décodée et analysée que si `accessToken` est truthy
          const payloadBase64 = accessToken.split(".")[1];
          const decodedToken = JSON.parse(atob(payloadBase64));
          const expirationDate = new Date(decodedToken.exp * 1000); // Convertir la date d'expiration en millisecondes

          if (expirationDate < new Date()) {
            // Redirection vers la page d'accueil si la date d'expiration est dépassée
            document.location.href = "/";
            return;
          }

          this.isAuthenticated = true;
          this.checkUserRole();
        } else {
          this.isAuthenticated = false;
        }
      } catch (e) {
        console.error('Erreur lors de la vérification de l\'authentification:', e);
        // Gestion des erreurs, par exemple, invalider l'authentification ou rediriger l'utilisateur
        this.isAuthenticated = false;
        // Redirection optionnelle ou gestion d'erreur spécifique
      }
    },
    checkUserRole() {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        this.userRole = decodedToken.role;
      } else {
        this.userRole = 0;
      }
    },
    logout() {
      localStorage.removeItem("accessToken");
      document.location.href = "/";
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>
