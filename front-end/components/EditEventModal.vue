<!-- EditEventModal.vue -->
<template>
    <TheModal :isOpen="isOpen" @close="close" title="Modifier l'événement">
        <form @submit.prevent="saveChanges(event.id)" data-event-id="event.id">
            <!-- Nom de l'événement -->
            <div class="flex flex-col mb-4">
                <label for="title">Titre du cours : </label>
                <input type="text" v-model="event.name_event" id="title"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" />
            </div>
            <!-- Description -->
            <div class="flex flex-col mb-4">
                <label for="description">Description du cours : </label>
                <textarea v-model="event.overview" id="description"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" placeholder=""></textarea>
            </div>
            <!-- Coach -->
            <div class="flex flex-col mb-4">
                <label for="coach">Nom du coach : </label>
                <input type="text" v-model="event.coach" id="coach"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" />
            </div>
            <!-- Date -->
            <div class="flex flex-col">
                <label class="font-semibold" for="date">Date et heure de début</label>
                <input type="datetime-local" v-model="formattedDate" @input="updateDate($event.target.value)" id="date"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" />
            </div>
            <!-- Duration -->
            <div class="flex flex-col">
                <label class="font-semibold" for="duration">Durée du cours (en minutes)</label>
                <input type="number" v-model="durationInMinutes" id="duration"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" />
            </div>
            <!-- Places -->
            <div class="flex flex-col mb-4">
                <label for="totalSeats">Nombre de places total disponibles :</label>
                <input type="number" v-model="event.totalPlaces" id="totalSeats"
                    class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md" />
            </div>

            <!-- Save -->
            <button type="submit"
                class="bg-green-500 w-full mt-4 text-white px-4 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                Sauvegarder
            </button>
        </form>
    </TheModal>
</template>

<script>
export default {
    props: {
        isOpen: Boolean,
        event: Object
    },
    data() {
        return {
            newDuration: null,
            newDate: null
        }
    },
    computed: {
        formattedDate: {
            get() {
                if (!this.event.date_event) return '';
                const date = new Date(this.event.date_event);
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                return localDate.toISOString().slice(0, 16);
            },
            set(value) {
                this.newDate = value;
            }
        },
        durationInMinutes: {
            get() {
                if (!this.event.duration) return 0;
                const hours = this.event.duration.hours || 0;
                const minutes = this.event.duration.minutes || 0;
                return (hours * 60) + minutes;
            },
            set(value) {
                this.newDuration = value
            }
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        saveChanges(eventId) {
            // Vérifier si newDate ou newDuration sont null ou undefined, et assigner les valeurs initiales si c'est le cas
            const finalDate = this.newDate || this.event.date_event;
            const finalDuration = this.newDuration !== null && this.newDuration !== undefined ? this.newDuration : this.event.duration;

            // Mettre à jour l'événement avec les nouvelles valeurs
            const updatedEvent = {
                ...this.event,
                date_event: new Date(finalDate).toISOString(),
                duration: finalDuration.toString()
            };

            this.$emit('save-changes', eventId, updatedEvent);
        },
        updateDate(value) {
            this.event.date_event = new Date(value).toISOString();
        },
    }
}
</script>
