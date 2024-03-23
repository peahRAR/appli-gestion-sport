<template>
    <div class="container mx-auto py-8">
        <h1 class="text-3xl font-semibold mb-4">Administration</h1>

        <!-- Liste des utilisateurs -->
        <div class="mb-8" style="overflow-x: auto;">
            <h2 class="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prénom
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut <!-- Ajoutez l'icône pour le statut ici -->
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(user, index) in users" :key="user.id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ index + 1 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ user.name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ user.firstname }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ user.email }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <!-- Ajoutez l'icône pour le statut ici -->
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <!-- Ajoutez le bouton pour ouvrir la modale ici -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Formulaire de création d'un nouveau cours -->
        <div>
            <h2 class="text-xl font-semibold mb-2">Créer un nouveau cours</h2>
            <form @submit.prevent="createCourse" class="flex flex-col space-y-4">
                <div class="flex flex-col">
                    <label for="title" class="font-semibold">Titre du cours</label>
                    <input type="text" v-model="newCourse.title" id="title"
                        class="border border-gray-300 px-4 py-2 rounded-md">
                </div>
                <div class="flex flex-col">
                    <label for="description" class="font-semibold">Description du cours</label>
                    <textarea v-model="newCourse.description" id="description"
                        class="border border-gray-300 px-4 py-2 rounded-md"></textarea>
                </div>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Créer le
                    cours</button>
            </form>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            users: [], // Liste des utilisateurs
            newCourse: { // Nouveau cours à créer
                title: '',
                description: ''
            }
        };
    },
    methods: {
        async createCourse() {
            // Logique pour créer un nouveau cours (à implémenter)
            console.log('Créer un nouveau cours :', this.newCourse);
            // Ici, vous pouvez envoyer une requête HTTP POST pour créer le cours
            // Réinitialisez le formulaire après la création réussie
            this.newCourse = { title: '', description: '' };
            // Affichez un message popup pour indiquer que le cours a été créé avec succès (à implémenter)
        },
        async loadUsers() {
            try {
                const token = localStorage.getItem('accessToken');
                // Faire une requête GET à votre API pour récupérer les utilisateurs
                const response = await useFetch('http://localhost:8080/users', {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Stocker les utilisateurs dans la variable users
                this.users = response.data;
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs', error);
            }
        },
    },
    created() {
        // Appel de la méthode pour récupérer la liste des utilisateurs lors de la création du composant
        this.loadUsers();
    }
};
</script>
