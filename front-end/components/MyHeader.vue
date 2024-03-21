<template>
    <div class="flex justify-between items-center p-4 bg-gray-800 text-white">
        <div v-if="isAuthenticated">
            <!-- Menu déroulant -->
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="flex items-center">
                    <!-- Icône de menu (à remplacer par votre propre icône) -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                <!-- Contenu du menu déroulant -->
                <div x-show="open" @click.away="open = false"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profil</a>
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Accueil</a>
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Cours inscrits</a>
                    <!-- Affichage de la page d'administration pour les utilisateurs avec un rôle spécifique -->
                    <template v-if="userRole === 1 || userRole === 2">
                        <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Administration</a>
                    </template>
                </div>
            </div>
        </div>
        <h1 class="text-2xl font-bold mx-auto">MMA Baisieux</h1>
        <div>
            <div v-if="isAuthenticated">
                <!-- Affichage de l'icône de déconnexion -->
                <button @click="logout" class="mr-4">
                    <!-- Icône de déconnexion (à remplacer par votre propre icône) -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Header",
    data() {
        return {
            isAuthenticated: false, // Modifier selon si un token valide est trouvé
            userRole: 0
        };
    },
    created() {
        // Appeler la méthode pour vérifier si un token valide est présent dans le localStorage lors de la création du composant
        this.checkAuthentication();
    },
    methods: {
        checkAuthentication() {
            // Récupérer le token d'accès depuis le localStorage
            const accessToken = localStorage.getItem('accessToken');
            // Vérifier si le token d'accès est présent et s'il est valide
            if (accessToken) {
                // Mettre à jour la propriété isAuthenticated à true
                this.isAuthenticated = true;
            } else {
                // Si aucun token d'accès n'est présent, ou s'il n'est pas valide, mettre à jour isAuthenticated à false
                this.isAuthenticated = false;
            }
        },
        logout() {
            // Supprimer le token d'accès du localStorage et rediriger vers la page de connexion
            localStorage.removeItem('accessToken');
            // Redirection vers la page de connexion
            // Remplacer '/login' par l'URL de votre page de connexion
            window.location.href = '/login';
        }
    }
};
</script>