<template>
    <div>
        <MyCalendar v-if="isAuthenticated" />
        <TheAuth v-else />
    </div>
</template>

<script>
export default {
    data() {
        return {
            isAuthenticated: null
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
        
    }
};


</script>