<template>
    <div>
        <h2 class="text-xl font-semibold mb-2">Gestion des {{ labelPlural }}</h2>

        <!-- Message si la table est vide -->
        <p v-if="holders.length === 0">Aucun {{ labelSingular.toLowerCase() }} n'a encore été assigné.</p>

        <!-- Tableau -->
        <table v-if="holders.length > 0" class="w-full border-collapse mb-4">
            <thead>
                <tr>
                    <th class="text-center">{{ labelSingular }}</th>
                    <th class="text-center">Utilisateur</th>
                    <th class="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(holder, index) in holders" :key="holder.id || index">
                    <td>{{ index + 1 }}</td>
                    <td>
                        <select v-model="holder.userId" @change="saveHolder(holder)">
                            <option disabled value="">Sélectionnez un utilisateur</option>
                            <option v-for="user in users" :value="user.id" :key="user.id">
                                {{ user.firstname }} {{ user.name }}
                            </option>
                        </select>
                    </td>
                    <td>
                        <button @click="removeHolder(index)"
                            class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600">Supprimer</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Bouton pour ajouter -->
        <button @click="addHolder" class="bg-blue-500 mb-1 text-white px-4 py-1 rounded-md hover:bg-blue-600">
            <Icon :name="iconName" />
            Ajouter {{ addButtonArticle }} {{ labelSingular.toLowerCase() }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'HolderManager',
    props: {
        users: {
            type: Array,
            required: true,
        },
        baseUrl: {
            type: String,
            required: true,
        },
        // e.g. "/keys" or "/badges"
        endpoint: {
            type: String,
            required: true,
        },
        // e.g. "keyNumber" or "badgeNumber" — the numeric field name on the entity
        numberField: {
            type: String,
            required: true,
        },
        // e.g. "Clé" / "Badge" (singular) — used in headers and messages
        labelSingular: {
            type: String,
            required: true,
        },
        // e.g. "Clés" / "Badges" (plural) — used in the section title
        labelPlural: {
            type: String,
            required: true,
        },
        iconName: {
            type: String,
            default: 'material-symbols:key-outline',
        },
    },
    data() {
        return {
            holders: [], // Liste des clés/badges assignés
        };
    },
    computed: {
        addButtonArticle() {
            // "une" for féminin (clé), "un" for masculin (badge) — best-effort default via vowel check
            return /^[aeiouyAEIOUY]/.test(this.labelSingular) ? "un(e)" : "un";
        },
    },
    methods: {
        async fetchHolders() {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error(`Erreur lors de la récupération des ${this.labelPlural.toLowerCase()}`);
                const data = await response.json();
                this.holders = data.map(item => ({
                    id: item.id,
                    userId: item.user ? item.user.id : '',
                }));
            } catch (error) {
                console.error(error);
                alert(`Impossible de récupérer la liste des ${this.labelPlural.toLowerCase()}.`);
            }
        },
        addHolder() {
            this.holders.push({
                id: null, // Identifiant nul pour les nouvelles entrées
                userId: '',
            });
        },
        async saveHolder(holder) {
            const token = localStorage.getItem("accessToken");

            if (!holder.userId) {
                alert('Veuillez sélectionner un utilisateur.');
                return;
            }

            try {
                let response;
                const body = { userId: holder.userId };
                if (!holder.id) {
                    body[this.numberField] = this.holders.length;
                }

                if (holder.id) {
                    response = await fetch(`${this.baseUrl}${this.endpoint}/${holder.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body),
                    });
                } else {
                    response = await fetch(`${this.baseUrl}${this.endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body),
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erreur lors de la sauvegarde:', errorData);
                    alert(`Erreur lors de la sauvegarde: ${response.status} ${response.statusText}`);
                    return;
                }

                const saved = await response.json();
                if (!holder.id) {
                    holder.id = saved.id;
                }
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Une erreur est survenue lors de la sauvegarde.');
            }
        },
        async removeHolder(index) {
            const token = localStorage.getItem("accessToken");
            const holder = this.holders[index];

            if (holder.id) {
                try {
                    const response = await fetch(`${this.baseUrl}${this.endpoint}/remove/${holder.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Erreur lors de la suppression:', errorData);
                        alert(`Erreur lors de la suppression: ${response.status} ${response.statusText}`);
                        return;
                    }

                    this.holders.splice(index, 1);
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Une erreur est survenue lors de la suppression.');
                }
            } else {
                this.holders.splice(index, 1);
            }
        },
    },
    async mounted() {
        await this.fetchHolders();
    },
};
</script>

<style scoped>
@reference "../../assets/main.css";

th,
td {
    @apply border text-center border-solid border-slate-200 dark:border-slate-600 p-3;
}

th {
    @apply bg-gray-50 dark:bg-gray-700;
}

select {
    width: 100%;
    padding: 8px;
}
</style>
