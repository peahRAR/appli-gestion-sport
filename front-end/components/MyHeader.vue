<template>
    <div class="flex justify-around items-center p-4 bg-gray-800 text-white">
        <div v-if="isAuthenticated">
            <!-- Affichage de l'icône de déconnexion -->
            <button @click="logout" class="mr-4">
                <!-- Icône de déconnexion (à remplacer par votre propre icône) -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024">
                    <path fill="currentColor"
                        d="M521.7 82c-152.5-.4-286.7 78.5-363.4 197.7c-3.4 5.3.4 12.3 6.7 12.3h70.3c4.8 0 9.3-2.1 12.3-5.8c7-8.5 14.5-16.7 22.4-24.5c32.6-32.5 70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8c47.9 0 94.3 9.3 137.9 27.8c42.2 17.8 80.1 43.4 112.7 75.9c32.6 32.5 58.1 70.4 76 112.5C865.7 417.8 875 464.1 875 512c0 47.9-9.4 94.2-27.8 137.8c-17.8 42.1-43.4 80-76 112.5s-70.5 58.1-112.7 75.9A352.8 352.8 0 0 1 520.6 866c-47.9 0-94.3-9.4-137.9-27.8A353.84 353.84 0 0 1 270 762.3c-7.9-7.9-15.3-16.1-22.4-24.5c-3-3.7-7.6-5.8-12.3-5.8H165c-6.3 0-10.2 7-6.7 12.3C234.9 863.2 368.5 942 520.6 942c236.2 0 428-190.1 430.4-425.6C953.4 277.1 761.3 82.6 521.7 82M395.02 624v-76h-314c-4.4 0-8-3.6-8-8v-56c0-4.4 3.6-8 8-8h314v-76c0-6.7 7.8-10.5 13-6.3l141.9 112a8 8 0 0 1 0 12.6l-141.9 112c-5.2 4.1-13 .4-13-6.3" />
                </svg>
            </button>
        </div>

        <h1 class="text-2xl font-bold mx-auto">MMA Baisieux</h1>

        <div v-if="isAuthenticated">
            <!-- Menu déroulant -->
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="flex items-center">
                    <!-- Icône de menu (à remplacer par votre propre icône) -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M4 18q-.425 0-.712-.288T3 17q0-.425.288-.712T4 16h16q.425 0 .713.288T21 17q0 .425-.288.713T20 18zm0-5q-.425 0-.712-.288T3 12q0-.425.288-.712T4 11h16q.425 0 .713.288T21 12q0 .425-.288.713T20 13zm0-5q-.425 0-.712-.288T3 7q0-.425.288-.712T4 6h16q.425 0 .713.288T21 7q0 .425-.288.713T20 8z" />
                    </svg>
                </button>
                <!-- Contenu du menu déroulant -->
                <div x-show="open" @click.away="open = false"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profil</a>
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Accueil</a>
                    <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Cours inscrits</a>
                    <!-- Affichage de la page d'administration pour les utilisateurs avec un rôle spécifique -->
                    <div v-if="userRole === 1 || userRole === 2">
                        <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Administration</a>
                    </div>
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
            isAuthenticated: false, // Modifier selon si un token valide est trouvé
            userRole: 0
        };
    },
    created() {
        // Appeler la méthode pour vérifier si un token valide est présent dans le localStorage lors de la création du composant
        this.checkAuthentication();
        this.checkUserRole();
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
        checkUserRole() {
            // Récupérer le token d'accès depuis le localStorage
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                // Analyser le token JWT pour extraire les informations sur l'utilisateur, telles que le rôle
                const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
                // Extraire le rôle de l'utilisateur du token
                const userRole = decodedToken.role; // Remplacer 'role' par le nom de la clé contenant le rôle dans le token
                // Mettre à jour la propriété userRole avec le rôle de l'utilisateur
                this.userRole = userRole;
            } else {
                // Si aucun token d'accès n'est présent, définir le rôle de l'utilisateur à 0 (ou autre valeur par défaut selon votre logique)
                this.userRole = 0;
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