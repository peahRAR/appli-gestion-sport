<template>




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
            <inputPassword @password="password = $event" :regex='regexPassword' label="Nouveau mot de passe : "
                id="password" :isValid="validerPassword" />

            <!-- Afficher un message d'erreur si le mot de passe ne respecte pas les critères  -->
            <p class="text-black-500 text-xs font-bold text-left mt-1">Votre mot de
                passe doit
                contenir au
                moins huit caractères et inclure au moins une lettre minuscule, une
                lettre majuscule, un chiffre et un caractère spécial parmi @$!%*?&.
            </p>
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

    <!-- TheModal -->
    <TheModal :isOpen="showModal" @close="closeModal">
        <span class="close absolute top-0 right-0 m-4 text-2xl cursor-pointer" @click="closeModal">&times;</span>
        <p class="text-center text-2xl mb-4 z-20">Vérifiez votre email pour terminer votre inscription.</p>
    </TheModal>


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
            regexPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            showModal: false, // Ajouter une propriété pour contrôler l'affichage de la modal
        };
    },
    computed: {
        // Pattern Regex
        patternRegex() {
            return this.regexPassword.toString().slice(1, -1)
        },
        // ValiderNewPassword
        validerPassword() {
            if (!this.regexPassword.test(this.password)) {

                return false
            }

            return true
        },
    },

    methods: {
        // SignUp method
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
        // Close The modal
        closeModal() {
            // Masquer la modal et réinitialiser le formulaire lorsque l'utilisateur ferme la modal
            this.showModal = false;
            this.clearForm();
        },
        // clear all the form inputs
        clearForm() {
            // Réinitialiser les valeurs des champs du formulaire
            this.user.email = null;
            this.user.password = null;
            this.user.name = null;
            this.user.firstname = null;
            this.user.birthday = null;
            this.user.gender = null;
        },
        // Regex
        validatePassword(password) {
            // Expression régulière pour valider le mot de passe
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return passwordRegex.test(password);
        },
    },
};
</script>
