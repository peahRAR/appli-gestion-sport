<template>

    <!-- La modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center h-64 m-auto">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-30"></div>
        <div class="modal-content bg-white rounded-lg p-8 max-w-md">
            <span class="close absolute top-0 right-0 m-4 text-2xl cursor-pointer" @click="closeModal">&times;</span>
            <p class="text-center text-2xl mb-4 z-20">Vérifiez votre email pour terminer votre inscription.</p>
        </div>
    </div>

    <form @submit.prevent="signUp">
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Genre</label>
            <div class="flex">
                <label class="inline-flex items-center mr-4">
                    <input v-model="user.gender" type="radio" name="gender" value="true" class="form-radio">
                    <span class="ml-2">Homme</span>
                </label>
                <label class="inline-flex items-center">
                    <input v-model="user.gender" type="radio" name="gender" value="false" class="form-radio">
                    <span class="ml-2">Femme</span>
                </label>
            </div>
        </div>
        <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nom</label>
            <input v-model="user.name" type="name" id="name" name="name" placeholder="Votre Nom"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
        </div>
        <div class="mb-4">
            <label for="firstname" class="block text-gray-700 text-sm font-bold mb-2">Prénom</label>
            <input v-model="user.firstname" type="firstname" id="firstname" name="firstname" placeholder="Votre Prénom"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
        </div>
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

        <div class="mb-4">
            <label for="birthdate" class="block text-gray-700 text-sm font-bold mb-2">Date d'anniversaire</label>
            <input v-model="user.birthday" type="date" id="birthdate" name="birthdate"
                placeholder="Votre date de naissance"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
        </div>

        <div class="flex justify-center">
            <button type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">S'inscrire</button>
        </div>
    </form>





</template>

<script>
export default {
    name: "TheRegister",
    data() {
        return {
            user: {
                email: null,
                password: null,
                name: null,
                firstname: null,
                birthday: null,
                gender: null,
            },
            showModal: false, // Ajouter une propriété pour contrôler l'affichage de la modal
        };
    },

    methods: {
        async signUp() {
            try {
                const { data } = await useFetch("http://localhost:8080/users", {
                    method: "POST",
                    mode: "cors",
                    body: JSON.stringify(this.user),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Si l'inscription réussit, vider les champs du formulaire et afficher la modal
                this.clearForm();
                this.showModal = true;
            } catch (error) {
                console.error("Erreur lors de la création du compte :", error);
            }
        },

        closeModal() {
            // Masquer la modal et réinitialiser le formulaire lorsque l'utilisateur ferme la modal
            this.showModal = false;
            this.clearForm();
        },

        clearForm() {
            // Réinitialiser les valeurs des champs du formulaire
            this.user.email = null;
            this.user.password = null;
            this.user.name = null;
            this.user.firstname = null;
            this.user.birthday = null;
            this.user.gender = null;
        },
    },
};
</script>
