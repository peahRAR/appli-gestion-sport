<template>
    <TheModal :isOpen="isOpen" title="Changement du mot de passe" @close="closeModal">
        <form @submit.prevent="changePassword" method="post">
            <div class="mb-4">
                <inputPassword v-model="currentPassword" label="Mot de passe actuel : " id="currentPassword"
                    :isValid="null" />
            </div>
            <div class="mb-4">
                <inputPassword v-model="newPassword" :regex="regexPassword" label="Nouveau mot de passe : "
                    id="newPassword" :isValid="validerNewPassword" />
                <check-password :isLength="isLength" :isSpecial="isSpecial" :isMaj="isMaj" :isMin="isMin"
                    :isNumber="isNumber" />
            </div>
            <div class="mb-4">
                <inputPassword label="Confirmer votre mot de passe : " id="confirmNewPassword"
                    v-model="confirmNewPassword" :isValid="validerConfirmPassword" />
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="submit"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Changer
                </button>
            </div>
        </form>
    </TheModal>
</template>

<script>
export default {
    name: 'ChangePasswordModal',
    props: {
        isOpen: Boolean,
        regexPassword: RegExp,
    },
    model: {
        prop: 'currentPassword',
        event: 'input',
    },
    data() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        };
    },
    computed: {
        validerNewPassword() {
            return this.regexPassword.test(this.newPassword);
        },
        validerConfirmPassword() {
            return this.confirmNewPassword === this.newPassword && this.validerNewPassword;
        },
        isLength() {
            return this.newPassword.length >= 8;
        },
        isMaj() {
            return /[A-Z]/.test(this.newPassword);
        },
        isMin() {
            return /[a-z]/.test(this.newPassword);
        },
        isSpecial() {
            return /[@$!%*?&]/.test(this.newPassword);
        },
        isNumber() {
            return /[0-9]/.test(this.newPassword);
        },
    },
    methods: {
        changePassword() {
            this.$emit('changePassword');
        },
        closeModal() {
            this.$emit('close');
        }
    }
};
</script>
