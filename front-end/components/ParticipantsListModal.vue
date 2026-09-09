<template>
    <TheModal :isOpen="isOpen" @close="close" title="Liste des participants">
        <ul class="w-full">
            <li v-for="participant in eventParticipants" :key="participant.id"
                :class="['flex', 'w-full', 'items-center', 'py-2', 'px-4', 'border', 'text-text', userBgColor(participant)]">
                <NuxtImg v-if="participant.avatar" :src="participant.avatar" alt="Avatar"
                    class="w-10 h-10 shrink-0 rounded-full mr-2" />
                <div v-else class="w-10 h-10 shrink-0 mr-2 rounded-full bg-bg flex items-center justify-center">
                    <span class="text-text-muted text-4xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
                  3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
                  8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
                  2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
                        </svg>
                    </span>
                </div>

                <div class="ml-3 flex w-full min-w-0 items-center justify-between gap-2">
                    <UserNameWithGrade v-if="userRole > 0" @click="openDetailsModal(participant)" :user="participant"
                        compact class="cursor-pointer font-bold capitalize min-w-0 flex-1" />
                    <UserNameWithGrade v-else :user="participant" compact class="font-bold capitalize min-w-0 flex-1" />
                    <button v-if="userRole > 0" @click="openDetailsModal(participant)"
                        class="shrink-0 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                        aria-label="Voir détails" title="Voir détails" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 6c-5 0-9.27 3.11-11 7.5C2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6m0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
                        </svg>
                    </button>
                </div>
            </li>
        </ul>
    </TheModal>
</template>

<script>
export default {
    props: {
        isOpen: Boolean,
        eventParticipants: Array,
        userRole: Number
    },
    methods: {
        close() {
            this.$emit('close');
        },
        userBgColor(participant) {
            if (this.userRole === 0) {
                return "";
            }
            if (participant) {
                if (
                    !participant.hasLicense &&
                    (!participant.date_end_pay || new Date(participant.date_end_pay) < new Date())
                ) {
                    return "bg-error/20";
                }
                if (
                    !participant.hasLicense ||
                    !participant.date_end_pay ||
                    new Date(participant.date_end_pay) < new Date()
                ) {
                    return "bg-warning/20";
                }
                if (
                    participant.hasLicense &&
                    participant.date_end_pay &&
                    new Date(participant.date_end_pay) >= new Date()
                ) {
                    return ""; // Rien à signaler : garde le fond de la modale
                }
            }
            return "";
        },
        openDetailsModal(participant) {
            this.$emit('open-details-modal', participant);
        }
    }
}
</script>
