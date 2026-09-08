<template>
    <TheModal :isOpen="isOpen" title="Changement du mot de passe" @close="closeModal">
        <form @submit.prevent="submit" method="post">
            <div class="mb-4">
                <inputPassword v-model="currentPassword" label="Mot de passe actuel : " id="currentPassword"
                    :isValid="null" />
            </div>
            <div class="mb-4">
                <inputPassword v-model="newPassword" :regex="regexPassword" label="Nouveau mot de passe : "
                    id="newPassword" :isValid="validerNewPassword" />
                <check-password :isLength="isLength" :isSpecial="isSpecial" :isMaj="isMaj" :isMin="isMin"
                    :isNumber="isNumber" />
                <p class="mt-1 text-xs text-text-muted">{{ passwordRuleMessage }}</p>
            </div>
            <div class="mb-4">
                <inputPassword label="Confirmer votre mot de passe : " id="confirmNewPassword"
                    v-model="confirmNewPassword" :isValid="validerConfirmPassword" />
            </div>
            <div class="bg-surface px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="submit"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-xs px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
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
    emits: ['close', 'changePassword'],
    data() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            passwordRuleMessage: PASSWORD_RULE_MESSAGE,
        };
    },
    watch: {
        // Reset the fields when the modal closes, so a stale password isn't
        // still sitting in the form the next time it's opened.
        isOpen(open) {
            if (!open) {
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmNewPassword = '';
            }
        },
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
            return [...this.newPassword].some((ch) => PASSWORD_SPECIAL_CHARS.includes(ch));
        },
        isNumber() {
            return /[0-9]/.test(this.newPassword);
        },
    },
    methods: {
        submit() {
            if (!this.currentPassword || !this.validerConfirmPassword) return;
            this.$emit('changePassword', {
                currentPassword: this.currentPassword,
                newPassword: this.newPassword,
            });
        },
        closeModal() {
            this.$emit('close');
        }
    }
};
</script>
