<template>
    <div>
        <form @submit.prevent="signIn">
            <div class="mb-4">
                <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input v-model="user.email" type="email" id="email" name="email" placeholder="Votre email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
            </div>
            <div class="mb-6">
                <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
                <input v-model="user.password" type="password" id="password" name="password"
                    placeholder="Votre mot de passe"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
            </div>
            <!-- Afficher le message d'erreur s'il y a lieu -->
            <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
            <div class="flex justify-center">
                <button type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Se
                    connecter</button>
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
                email: null,
                password: null,
            },
            errorMessage: "", // Variable pour stocker le message d'erreur
        };
    },

    methods: {
        async signIn() {
            try {
                const { data } = await useFetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify(this.user),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Vérifiez si la connexion a réussi et que le token d'accès est présent dans la réponse
                if (data && data.value && data.value.access_token) {
                    // Stockez le token d'accès dans le localStorage
                    localStorage.setItem('accessToken', data.value.access_token);
                    console.log('Token d\'accès stocké dans le localStorage :', data.value.access_token);
                } else {
                    // Afficher un message d'erreur si le token d'accès n'est pas trouvé dans la réponse
                    this.errorMessage = "Email ou mot de passe invalide.";
                }
            } catch (error) {
                console.error('Erreur lors de la connexion :', error);
                // Afficher un message d'erreur générique en cas d'erreur
                this.errorMessage = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
            }
        }
    },
};
</script>