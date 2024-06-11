<template>
    <TheModal :isOpen="isOpen" @close="close" title="Liste des participants">
        <ul class="w-full">
            <li v-for="participant in eventParticipants" :key="participant.id"
                :class="['flex', 'w-full', 'items-center', 'py-2', 'px-4', 'border', userBgColor(participant)]">
                <NuxtImg v-if="participant.avatar" :src="participant.avatar" alt="Avatar"
                    class="w-10 h-10 rounded-full mr-2" />
                <div v-else class="w-10 h-10 mr-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-gray-600 text-4xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
                  3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
                  8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
                  2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
                        </svg>
                    </span>
                </div>

                <div class="ml-3 flex w-full justify-between">
                    <span v-if="userRole > 0" @click="openDetailsModal(participant)"
                        class="cursor-pointer font-bold capitalize">{{ participant.firstname }} {{ participant.name
                        }}</span>
                    <span v-else class="font-bold capitalize"> {{ participant.firstname }} {{ participant.name }}</span>
                    <button v-if="userRole > 0" @click="openDetailsModal(participant)" class="underline">Voir
                        détails</button>
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
                return "bg-white";
            }
            if (participant) {
                if (
                    !participant.license &&
                    (!participant.date_end_pay || new Date(participant.date_end_pay) < new Date())
                ) {
                    return "bg-red-500 bg-opacity-75";
                }
                if (
                    !participant.license ||
                    !participant.date_end_pay ||
                    new Date(participant.date_end_pay) < new Date()
                ) {
                    return "bg-orange-500 bg-opacity-75";
                }
                if (
                    participant.license &&
                    participant.date_end_pay &&
                    new Date(participant.date_end_pay) >= new Date()
                ) {
                    return "bg-white";
                }
            }
            return "bg-white";
        },
        openDetailsModal(participant) {
            this.$emit('open-details-modal', participant);
        }
    }
}
</script>
