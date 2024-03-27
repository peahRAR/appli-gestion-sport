<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Réinitialiser votre mot de passe
                </h2>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="resetPassword">
                <input type="hidden" name="token" v-model="token">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="password" class="sr-only">Nouveau mot de passe</label>
                        <input v-model="password" id="password" name="password" type="password"
                            autocomplete="new-password" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Nouveau mot de passe">
                    </div>
                    <div>
                        <label for="confirmPassword" class="sr-only">Confirmer le mot de passe</label>
                        <input v-model="confirmPassword" id="confirmPassword" name="confirmPassword" type="password"
                            autocomplete="new-password" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Confirmer le mot de passe">
                    </div>
                </div>
                <div>
                    <button type="submit"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
            token: '',
            password: '',
            confirmPassword: ''
        };
    },
    created() {
        // Récupérer le token depuis l'URL
        this.token = this.$route.params.token;
    },
    methods: {
        async resetPassword() {
            const userId = this.getUserIdFromToken();
            if (this.password !== this.confirmPassword) {
                alert("Les mots de passe ne correspondent pas.");
                return;
            }

            await useFetch(`http://localhost:8080/users/${userId}`, {
                method: 'PATCH',
                mode: 'cors',
                body: JSON.stringify(this.user),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        },
        getUserIdFromToken() {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('Aucun token trouvé dans le localStorage.');
                return null;
            }

            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Le token JWT est invalide.');
                return null;
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            if (!payload || !payload.sub) {
                console.error('Impossible de trouver le champ "sub" dans le token.');
                return null;
            }

            return payload.sub;
        },
    }
};
</script>
