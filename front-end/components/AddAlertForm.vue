<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Ajouter une alerte</h2>
    <form @submit.prevent="submitAlert" class="flex flex-col space-y-4">
      <!-- Titre -->
      <div class="flex flex-col">
        <label for="titre" class="font-semibold">Titre :</label>
        <input
          type="text"
          v-model="newAlert.titre"
          id="titre"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
          required
        />
      </div>
      <!-- Contenu -->
      <div class="flex flex-col">
        <label for="contenu" class="font-semibold">Contenu :</label>
        <textarea
          v-model="newAlert.contenu"
          id="contenu"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
          required
        ></textarea>
      </div>
      <!-- Date de fin -->
      <div class="flex flex-col">
        <label for="dateFin" class="font-semibold"
          >Date de fin de validité :</label
        >
        <input
          type="date"
          v-model="newAlert.dateFin"
          id="dateFin"
          class="border border-gray-300 bg-gray-200 px-4 py-2 rounded-md"
          required
        />
      </div>
      <!-- Bouton de soumission -->
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Ajouter l'alerte
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newAlert: {
        titre: "",
        contenu: "",
        dateFin: "",
      },
    };
  },
  methods: {
    submitAlert() {
      // Émettre un événement vers le parent avec les informations de la nouvelle alerte
      this.$emit("new-alert", this.newAlert);
      this.newAlert.titre = "";
      this.newAlert.contenu = "";
      this.newAlert.dateFin = "";
    },
  },
};
</script>
