<template>
    <div>
        <h2 class="text-xl font-semibold mb-2">Gestion des Clés</h2>

        <!-- Message si la table est vide -->
        <p v-if="keyHolders.length === 0">Aucune clé n'a encore été assignée.</p>

        <!-- Tableau des clés -->
        <table v-if="keyHolders.length > 0" class="w-full border-collapse mb-4">
            <thead>
                <tr>
                    <th class="text-center">Clé</th>
                    <th class="text-center">Utilisateur</th>
                    <th class="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(keyHolder, index) in keyHolders" :key="keyHolder.id || index">
                    <td>{{ index + 1 }}</td>
                    <td>
                        <select v-model="keyHolder.userId" @change="saveKeyHolder(keyHolder)">
                            <option disabled value="">Sélectionnez un utilisateur</option>
                            <option v-for="user in users" :value="user.id" :key="user.id">
                                {{ user.firstname }} {{ user.name }}
                            </option>
                        </select>
                    </td>
                    <td>
                        <button @click="removeKeyHolder(index)"
                            class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600">Supprimer</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Bouton pour ajouter une nouvelle clé -->
        <button @click="addKeyHolder" class="bg-blue-500 mb-1 text-white px-4 py-1 rounded-md hover:bg-blue-600">
            <Icon name="material-symbols:key-outline" />
            Ajouter une clé
        </button>
    </div>
</template>

<script>
export default {
    name: 'KeyManager',
    props: {
        users: {
            type: Array,
            required: true,
        },
        baseUrl: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            keyHolders: [], // Liste des clés assignées
        };
    },
    methods: {
        async fetchKeyHolders() {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${this.baseUrl}/keys`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Erreur lors de la récupération des clés');
                const data = await response.json();
                this.keyHolders = data.map(item => ({
                    id: item.id,
                    userId: item.user ? item.user.id : '',
                }));
            } catch (error) {
                console.error(error);
                alert('Impossible de récupérer la liste des clés.');
            }
        },
        addKeyHolder() {
            this.keyHolders.push({
                id: null, // Identifiant nul pour les nouvelles entrées
                userId: '',
            });
        },
        async saveKeyHolder(keyHolder) {
            const token = localStorage.getItem("accessToken");

            if (!keyHolder.userId) {
                alert('Veuillez sélectionner un utilisateur pour chaque clé.');
                return;
            }

            try {
                let response;
                if (keyHolder.id) {
                    // Si l'entrée a un ID, c'est une mise à jour (PATCH)
                    console.log(`PATCH request to URL: ${this.baseUrl}/keys/${keyHolder.id}`);
                    response = await fetch(`${this.baseUrl}/keys/${keyHolder.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,  // Ajouter le token ici
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: keyHolder.userId }),
                    });
                } else {
                    // Si l'entrée n'a pas d'ID, c'est une création (POST)
                    console.log(`POST request to URL: ${this.baseUrl}/keys`);
                    response = await fetch(`${this.baseUrl}/keys`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,  // Ajouter le token ici
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: keyHolder.userId,
                            keyNumber: this.keyHolders.length // ou une autre logique pour définir le numéro de clé
                        }),
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erreur lors de la sauvegarde:', errorData);
                    alert(`Erreur lors de la sauvegarde: ${response.status} ${response.statusText}`);
                    return;
                }

                // Si la requête a réussi et que c'était un POST, mettre à jour l'ID localement
                const savedKey = await response.json();
                if (!keyHolder.id) {
                    keyHolder.id = savedKey.id;
                }

            } catch (error) {
                console.error('Erreur lors de la sauvegarde des clés:', error);
                alert('Une erreur est survenue lors de la sauvegarde.');
            }
        },
        async removeKeyHolder(index) {
            const token = localStorage.getItem("accessToken");
            const keyHolder = this.keyHolders[index];

            if (keyHolder.id) {
                try {
                    console.log(`DELETE request to URL: ${this.baseUrl}/keys/remove/${keyHolder.id}`);
                    const response = await fetch(`${this.baseUrl}/keys/remove/${keyHolder.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,  // Ajouter le token ici
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Erreur lors de la suppression:', errorData);
                        alert(`Erreur lors de la suppression: ${response.status} ${response.statusText}`);
                        return;
                    }

                    // Supprimez l'entrée du tableau uniquement si la suppression côté serveur a réussi
                    this.keyHolders.splice(index, 1);
                } catch (error) {
                    console.error('Erreur lors de la suppression de la clé:', error);
                    alert('Une erreur est survenue lors de la suppression.');
                }
            } else {
                // Si la clé n'a pas encore été enregistrée sur le serveur, supprimez simplement l'entrée du tableau
                this.keyHolders.splice(index, 1);
            }
        },
    },
    async mounted() {
        await this.fetchKeyHolders();
    },
};
</script>

<style scoped>

th,
td {
    @apply border text-center border-solid border-slate-200 p-3  ; 
}

th {
    background-color: #f9f9f9;
}

select {
    width: 100%;
    padding: 8px;
}
</style>
