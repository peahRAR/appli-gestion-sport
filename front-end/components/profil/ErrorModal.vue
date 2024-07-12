<template>
    <TheModal :isOpen="isOpen" title="Message" @close="closeModal">
        {{ message }}
    </TheModal>
</template>

<script>
export default {
    name: 'Error',
    props: {
        isOpen: Boolean,
        message: String
    },
    methods: {
        closeModal() {
            this.$emit('close');
        }
    }
};
</script>
