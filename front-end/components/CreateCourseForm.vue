<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Créer un nouveau cours</h2>
    <form @submit.prevent="submitForm" class="flex flex-col space-y-4">
      <!-- Name Event -->
      <div class="flex flex-col">
        <label for="title" class="font-semibold">Titre du cours</label>
        <input
          type="text"
          v-model="newCourse.name_event"
          id="title"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        />
      </div>
      <!-- Overview -->
      <div class="flex flex-col">
        <label for="description" class="font-semibold">Description du cours</label>
        <textarea
          v-model="newCourse.overview"
          id="description"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        ></textarea>
      </div>
      <!-- Coach -->
      <div class="flex flex-col">
        <label class="font-semibold" for="coach">Nom du coach</label>
        <input
          type="text"
          v-model="newCourse.coach"
          id="coach"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        />
      </div>
      <!-- Date -->
      <div class="flex flex-col">
        <label class="font-semibold" for="date">Date et heure de début</label>
        <input
          type="datetime-local"
          v-model="newCourse.date_event"
          id="date"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        />
      </div>
      <!-- Duration -->
      <div class="flex flex-col">
        <label class="font-semibold" for="duration">Durée du cours (en minutes)</label>
        <input
          type="number"
          v-model="newCourse.duration"
          id="duration"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        />
      </div>
      <!-- Total places -->
      <div class="flex flex-col">
        <label class="font-semibold" for="totalSeats"
          >Nombre de places total disponibles</label
        >
        <input
          type="number"
          v-model="newCourse.totalPlaces"
          id="totalSeats"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
        />
      </div>

      <!-- Visibility -->
      <div class="flex items-center gap-3 mt-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="newCourse.isVisible" class="sr-only peer" />
          <div
            class="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200"
          ></div>
          <div
            class="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 peer-checked:translate-x-6"
          ></div>
        </label>
        <span
          class="text-sm font-medium"
          :class="newCourse.isVisible ? 'text-green-600' : 'text-gray-500'"
        >
          {{ newCourse.isVisible ? "Visible" : "Masqué" }}
        </span>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Créer le cours
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newCourse: {
        name_event: "",
        overview: "",
        date_event: "",
        coach: "",
        duration: 0,
        totalPlaces: 0,
        isVisible: true,
      },
    };
  },
  methods: {
    submitForm() {
      // Convertir la date locale en UTC
      const localDate = new Date(this.newCourse.date_event).toISOString();

      // Assigner la date en UTC à newCourse.date_event
      this.newCourse.date_event = localDate;

      // Émettre l'événement avec les données du formulaire
      this.$emit("create", this.newCourse);

      // Réinitialiser le formulaire
      this.newCourse = {
        name_event: "",
        overview: "",
        date_event: "",
        coach: "",
        duration: 0,
        totalPlaces: 0,
        isVisible: true,
      };
    },
  },
};
</script>
