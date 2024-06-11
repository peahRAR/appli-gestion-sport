<!-- EditUserModal.vue -->
<template>
    <TheModal :isOpen="isOpen" title="Informations utilisateurs" @close="close">
        <!-- Modale Utilisateur  -->
        <!-- Input Name -->
        <div class="avatar flex justify-center mb-2">
            <div class="relative w-20 h-20 mr-2 rounded-full">
                <NuxtImg v-if="user.avatar" :src="user.avatar" alt="Avatar" class="w-full h-full rounded-full" />
                <!-- If Avatar === null -->
                <div v-else class="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-gray-600 text-4xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
                3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
                8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
                2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
                        </svg>
                    </span>
                </div>
                <Icon :name="user.gender ? 'ph:gender-male-bold' : 'ph:gender-female-bold'"
                    :class="user.gender ? 'bg-blue-300' : 'bg-pink-300'"
                    class="absolute bottom-0 right-0 w-6 h-6 p-1 rounded-full" />
            </div>
        </div>

        <!-- User name firstname -->
        <div class="mb-2 flex justify-center">
            <strong class="text-center text-2xl">{{ user.firstname }} {{ user.name }}</strong>
        </div>

        <p class="mb-2"><strong>E-mail:</strong> {{ user.email }}</p>
        <!-- Age -->
        <p class="mb-2">
            <strong>Age :</strong>
            {{ user.birthday + "ans" }}
        </p>

        <!-- Weight -->
        <p>
            <strong>Poids:</strong>
            {{ (user.weight) || "Non renseigné" }}
        </p>
        <p class="mb-2">
            <strong>Numéro de téléphone:</strong>
            {{ (user.tel_num && user.tel_num) || "Non renseigné" }}
        </p>
        <!-- Tel Medic -->
        <p class="mb-2">
            <strong>Téléphone médical:</strong>
            {{ (user.tel_medic && user.tel_medic) || "Non renseigné" }}
        </p>
        <!-- Tel emergency -->
        <p class="mb-2">
            <strong>Téléphone d'urgence:</strong>
            {{ (user.tel_emergency && user.tel_emergency) || "Non renseigné" }}
        </p>
        <!-- Payment input -->
        <div class="mb-2">
            <label for="datePayment"><strong>Date de paiement:</strong></label>
            <input class="border border-gray-500 p-1" type="date" v-model="user.date_payment" id="datePayment" />
            <span v-if="!user.date_payment">Aucun paiement en cours</span>
        </div>
        <!-- End Pay input -->
        <div class="mb-2">
            <label for="dateEndPay"><strong>Date de fin de paiement:</strong></label>
            <input class="border border-gray-500 p-1" type="date" v-model="user.date_end_pay" id="dateEndPay" />
            <span v-if="!user.date_end_pay">Aucun paiement en cours</span>
        </div>

        <!-- Buttons -->
        <div class="flex flex-row justify-between">
            <!-- Update User -->
            <button @click="updateUser" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Enregistrer
            </button>
            <!-- Delete User -->
            <button v-if="user.role != 2" @click="deleteUser(user)"
                class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Supprimer Utilisateur
            </button>
            <!-- Button For change role user -->
            <div v-if="getUserRole() === 2 && user.role != 2">
                <button @click="toggleUserRole(user.id)"
                    :class="user.role === 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'"
                    class="text-white px-4 py-2 rounded-md">
                    {{ user.role === 0 ? 'Passer Admin' : 'Révoquer les droits Admin' }}
                </button>
            </div>
        </div>
    </TheModal>
</template>

<script>
export default {
    props: {
        isOpen: Boolean,
        user: Object
    },
    methods: {
        close() {
            this.$emit('close');
        },
        updateUser() {
            this.$emit('update-user');
        },
        deleteUser(user) {
            this.$emit('delete-user', user);
        },
        getUserRole() {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const tokenParts = token.split(".");
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    return payload.role;
                } else {
                    console.error("Token JWT invalide");
                    return null;
                }
            } else {
                console.error("Token JWT introuvable dans le localStorage");
                return null;
            }
        },
        toggleUserRole(userId) {
            const newRole = this.user.role === 0 ? 1 : 0;
            this.$emit('change-role', userId, newRole);
        },
    }
}
</script>
