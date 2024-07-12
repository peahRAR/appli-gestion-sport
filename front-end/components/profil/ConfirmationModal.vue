<template>
    <TheModal :isOpen="isOpen" :title="message" @close="cancel">
        <div class="flex justify-center space-x-4">
            <button @click="confirm"
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Confirmer
            </button>
            <button @click="cancel"
                class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Annuler
            </button>
        </div>
    </TheModal>
</template>

<script>
export default {
    name: 'ConfirmationModal',
    props: {
        isOpen: Boolean,
        message: String
    },
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        }
    }
};
</script>
