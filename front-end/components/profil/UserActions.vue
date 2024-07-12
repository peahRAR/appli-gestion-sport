<template>
    <div class="flex flex-col">
        <button @click="editProfile" v-if="!isEditing"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
            Modifier le profil
        </button>
        <button @click="openModal"
            class="bg-yellow-600 w-full hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4">
            Changer le mot de passe
        </button>
        <button @click="confirmDelete" v-if="!isEditing"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
            Supprimer le compte
        </button>
    </div>
</template>

<script>
export default {
    name: 'UserActions',
    props: {
        isEditing: Boolean
    },
    methods: {
        editProfile() {
            this.$emit('editProfile');
        },
        openModal() {
            this.$emit('openModal');
        },
        confirmDelete() {
            this.$emit('confirmDelete');
        }
    }
};
</script>
