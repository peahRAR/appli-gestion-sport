<template>
    <div>
        <form @submit.prevent="changePassword">
            <label for="newPassword">Nouveau mot de passe:</label>
            <input type="password" id="newPassword" v-model="newPassword" required>

            <label for="confirmNewPassword">Confirmer le nouveau mot de passe:</label>
            <input type="password" id="password" v-model="user.password" required>

            <button type="submit">Changer le mot de passe</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            userId:null,
            user: { password: '' },
            newPassword: '',
        };
    },
    methods: {
        async changePassword() {
            try {
                // Vérifier si le nouveau mot de passe correspond à la confirmation
                if (this.newPassword !== this.user.password) {
                    console.error('Le nouveau mot de passe ne correspond pas à la confirmation.');
                    return;
                }

                const token = localStorage.getItem('accessToken');
                // Préparer les données à envoyer à l'API
                const userData = {
                    userId: localStorage.accessToken.sub,
                    newPassword: this.user.password // Envoyer la confirmation comme nouveau mot de passe
                };

                // Envoyer une requête POST à votre API pour changer le mot de passe
                const response = await useFetch('http://localhost:8080/users', {
                    method: 'PATCH',
                    mode: 'cors',
                    body: JSON.stringify(this.user),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        
                    }
                });

                // Gérer la réponse de l'API en conséquence
                console.log('Mot de passe changé avec succès', response.data);
            } catch (error) {
                console.error('Erreur lors du changement de mot de passe', error);
            }
        }
    }
};
</script>
