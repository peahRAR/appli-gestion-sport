<template>
    <div class="w-full container m-auto">
        <TheModal :isOpen="isOpen" title="Modifications" @close="cancelEdit">
            <UploadAvatar :user-avatar="user.avatar" @avatarSaved="updateAvatar"
                message="Fichier image png, jpeg ou jpg de moins de 3 Mo" />

            <div class="w-full flex items-baseline">
                <p>Poids:</p>
                <input type="number" step="0.01" v-model="editedWeight"
                    @input="updateField('editedWeight', $event.target.value)" placeholder="Nouveau poids"
                    class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2" />
                <p class="ml-2">Kg</p>
            </div>
            <div class="w-full flex items-baseline">
                <p>Licence:</p>
                <input type="text" v-model="editedLicense" @input="updateField('editedLicense', $event.target.value)"
                    placeholder="Nouvelle license"
                    class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2" />
            </div>
            <div class="w-full flex items-baseline">
                <p>Téléphone portable:</p>
                <input type="text" v-model="editedTelNum" @input="updateField('editedTelNum', $event.target.value)"
                    placeholder="Nouveau numéro"
                    class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2" />
            </div>
            <div class="w-full flex items-baseline">
                <p>Téléphone médicale:</p>
                <input type="text" v-model="editedTelMedic" @input="updateField('editedTelMedic', $event.target.value)"
                    placeholder="Nouveau téléphone médical"
                    class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2" />
            </div>
            <div class="w-full flex items-baseline">
                <p>Téléphone d'urgence:</p>
                <input type="text" v-model="editedTelEmergency"
                    @input="updateField('editedTelEmergency', $event.target.value)"
                    placeholder="Nouveau téléphone d'urgence"
                    class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2" />
            </div>

            <button @click="saveChanges"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 text-center rounded mt-4">
                Enregistrer les modifications
            </button>

        </TheModal>
    </div>
</template>

<script>
export default {
    name: 'EditProfileModal',
    props: {
        isOpen: Boolean,
        user: Object,
    },
    data() {
        return {
            editedWeight: this.user.weight,
            editedLicense: this.user.license,
            editedTelNum: this.user.tel_num,
            editedTelMedic: this.user.tel_medic,
            editedTelEmergency: this.user.tel_emergency,
            avatarBlob: null // Mettre à jour avec le blob de l'avatar
        };
    },
    methods: {
        updateField(field, value) {
            this[field] = value;
            this.$emit(`update:${field}`, value);
        },
        updateAvatar(blob) {
            this.avatarBlob = blob; // Mettre à jour le blob de l'avatar
        },
        saveChanges() {
            const updatedProfile = {
                avatar: this.avatarBlob, // Inclure le blob de l'avatar
                weight: this.editedWeight,
                license: this.editedLicense,
                tel_num: this.editedTelNum,
                tel_medic: this.editedTelMedic,
                tel_emergency: this.editedTelEmergency,
            };
            this.$emit('saveChanges', updatedProfile);
        },
        cancelEdit() {
            this.$emit('cancelEdit');
        }
    }
};
</script>