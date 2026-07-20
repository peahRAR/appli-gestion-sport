<template>
    <div class="card">
        <div class="bg-surface rounded-lg relative shadow-md overflow-hidden border border-border mx-2">
            <div class="py-2 px-4 flex justify-between">
                <!--TOP CARD -->
                <h2 class="text-lg font-semibold text-text">{{ event.formattedDate }}</h2>

                <div class="flex flex-row justify-between items-center rounded-sm px-1 cursor-pointer"
                    :class="placesClass">
                    <Icon name="streamline:tickets-solid" class="mr-1" />
                    <p class="text-text font-semibold text-xs">
                        {{ event.places }}
                    </p>
                </div>
            </div>
            <hr>

            <!--BODY CARD-->
            <div class="flex flex-col py-2 px-4">
                <div class="flex justify-between items-center">
                    <!--Event Name-->
                    <h3 class="text-lg font-semibold text-text uppercase">
                        {{ event.name_event }}
                    </h3>

                    <!--Coach Name-->
                    <div class="flex items-center">
                        <Icon name="material-symbols:sports-mma" class="text-xl mr-1" />
                        <p class="text-text-muted">{{ event.coach }}</p>
                    </div>
                </div>

                <!--Time & Duration-->
                <div class="time flex items-center">
                    <Icon name="material-symbols:nest-clock-farsight-analog-outline" class="mr-1 text-xl" />
                    <p class="text-text font-semibold">De:</p>
                    <p class="text-text font-semibold ml-1">
                        {{ event.formattedTime }} à {{ event.formattedEndTime }}
                    </p>

                    <p class="text-text-muted ml-1">
                        ({{ event.formattedDuration }})
                    </p>
                </div>

                <!--More informations-->
                <div v-if="event.overview" class="flex flex-col my-4">
                    <p class="text-text-muted mb-4 p-1 text-left" :class="{ 'line-clamp-3': !event.showOverflow }">
                        {{ event.overview }}
                    </p>
                    <button @click="emitToggleOverflow"
                        class="text-text font-semibold text-sm text-center focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                        v-if="event.overview.length > 150 || showOverflow">
                        Afficher {{ event.showOverflow ? "moins &#x25B2;" : "plus &#x25BC;" }}
                    </button>
                </div>

                <div class="flex justify-center items-center">
                    <!--Affichage des participants ici-->
                    <Icon v-if="participants === 1" name="fa6-solid:user" class="mr-1" />
                    <Icon v-if="participants > 1" name="fa6-solid:people-group" class="mr-1" />
                    <div class="partipants font-bold">
                        <div v-if="participants > 0" @click="openModal(event)"
                            class="clickable inline-block underline cursor-pointer">
                            <span class="pr-2">{{ participants }} {{ participantWord }}</span>
                        </div>
                        <span>
                            {{ participantMessage }}
                        </span>
                    </div>
                </div>

                <!--Buttons-->
                <div class="flex items-center justify-between mt-4">
                    <div class="buttons w-full flex flex-col font-semibold">
                        <button @click.stop="participate(event, true)" @mousedown="isPresentButtonActive = true"
                            @mouseup="isPresentButtonActive = false" @mouseleave="isPresentButtonActive = false"
                            :class="[presentButtonClass, { 'cursor-not-allowed ': event.isParticipating === true }]"
                            :disabled="event.isParticipating === true"
                            class="border border-border-strong drop-shadow-lg py-1 px-3 rounded-sm mb-2 flex justify-center items-center">
                            Présent
                        </button>
                        <button @click.stop="participate(event, false)" @mousedown="isAbsentButtonActive = true"
                            @mouseup="isAbsentButtonActive = false" @mouseleave="isAbsentButtonActive = false"
                            :class="[absentButtonClass, { 'cursor-not-allowed ': event.isParticipating === false }]"
                            :disabled="event.isParticipating === false"
                            class="border border-border-strong drop-shadow-lg py-1 px-3 rounded-sm mb-2 flex justify-center items-center">
                            Absent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        event: Object,
    },
    data() {
        return {
            showOverflow: false,
            isPresentButtonActive: false,
            isAbsentButtonActive: false,
        };
    },
    methods: {
        openModal(event) {
            this.$emit('open-modal', event);
        },
        participate(event, value) {
            this.$emit('participate', event, value);
        },
        emitToggleOverflow() {
            this.$emit('toggle-overflow', this.event.id);
        },
    },
    computed: {
        placesClass() {
            if (this.event.places === 0) return 'bg-red-400';
            if (this.event.places > 0 && this.event.places <= this.event.totalPlaces * 0.2) return 'bg-orange-500';
            return 'bg-green-600';
        },
        presentButtonClass() {
            if (this.event.isParticipating === true) {
                return 'bg-green-600 text-white'; // Non cliquable et vert
            }
            return 'bg-surface-2 text-text'; // Cliquable, état neutre
        },
        absentButtonClass() {
            if (this.event.isParticipating === false) {
                return 'bg-red-600 text-white'; // Non cliquable et rouge
            }
            return 'bg-surface-2 text-text'; // Cliquable, état neutre
        },
        participants() {
            return this.event.totalPlaces - this.event.places;
        },
        participantMessage() {
            const participants = this.participants;
            if (participants === 0) {
                return "Il n'y a aucun participant pour le moment";
            } else if (participants === 1) {
                return "est inscrit à ce cours";
            } else {
                return `sont inscrits à ce cours`;
            }
        },
        participantWord() {
            return this.participants === 1 ? 'participant' : 'participants';
        }
    },
};
</script>
