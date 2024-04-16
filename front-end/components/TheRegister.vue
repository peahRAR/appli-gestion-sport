<template>
  <form @submit.prevent="signUp">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Genre</label>
      <div class="flex">
        <label class="inline-flex items-center mr-4">
          <input
            v-model="user.gender"
            type="radio"
            name="gender"
            value="true"
            class="form-radio"
          />
          <span class="ml-2">Homme</span>
        </label>
        <label class="inline-flex items-center">
          <input
            v-model="user.gender"
            type="radio"
            name="gender"
            value="false"
            class="form-radio"
          />
          <span class="ml-2">Femme</span>
        </label>
      </div>
    </div>
    <div class="mb-4">
      <label for="name" class="block text-gray-700 text-sm font-bold mb-2"
        >Nom</label
      >
      <input
        v-model="user.name"
        type="name"
        id="name"
        required
        name="name"
        placeholder="Votre Nom"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
      />
    </div>
    <div class="mb-4">
      <label for="firstname" class="block text-gray-700 text-sm font-bold mb-2"
        >Prénom</label
      >
      <input
        v-model="user.firstname"
        type="firstname"
        id="firstname"
        required
        name="firstname"
        placeholder="Votre Prénom"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
      />
    </div>
    <div class="mb-4">
      <label for="email" class="block text-gray-700 text-sm font-bold mb-2"
        >Email</label
      >
      <input
        v-model="user.email"
        type="email"
        id="email"
        required
        name="email"
        placeholder="Votre email"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
      />
    </div>
    <div class="mb-6">
      <inputPassword
        v-model="user.password"
        :regex="regexPassword"
        label="Nouveau mot de passe : "
        id="password"
        :isValid="validerPassword"
      />

      <!-- Afficher un message d'erreur si le mot de passe ne respecte pas les critères  -->
      <check-password
        :isLength="isLength"
        :isSpecial="isSpecial"
        :isMaj="isMaj"
        :isMin="isMin"
        :isNumber="isNumber"
      />
    </div>
    <inputPassword
      label="Confirmer votre mot de passe : "
      id="confirmNewPassword"
      v-model="confirmNewPassword"
      :isValid="validerConfirmPassword"
      ref="confirmPassword"
      class="mb-4"
    />

    <div class="mb-4">
      <label for="birthdate" class="block text-gray-700 text-sm font-bold mb-2"
        >Date d'anniversaire</label
      >
      <input
        v-model="user.birthday"
        type="date"
        required
        id="birthdate"
        name="birthdate"
        placeholder="Votre date de naissance"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
      />
    </div>
    <div class="mb-4">
      <label for="acceptConditions">
        <input
          type="checkbox"
          id="acceptConditions"
          name="acceptConditions"
          required
        />
        J'accepte les
        <NuxtLink href="/terms" target="_blank" class="underline text-blue">Conditions d'Utilisation</NuxtLink>
      </label>
    </div>

    <div class="flex justify-center">
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        S'inscrire
      </button>
    </div>
  </form>

  <!-- TheModal -->
  <TheModal :isOpen="showModal" @close="closeModal">
    <p class="text-center text-2xl mb-4 z-20">
      Vérifiez vos emails pour terminer votre inscription.
    </p>
  </TheModal>
  <TheModal :isOpen="showErrorModal" title="Message" @close="closeErrorModal">{{
    this.errorMessage
  }}</TheModal>
</template>

<script>
export default {
  name: "TheRegister",
  data() {
    return {
      user: {
        email: null,
        password: "",
        name: null,
        firstname: null,
        birthday: null,
        gender: null,
      },
      regexPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      showModal: false, // Ajouter une propriété pour contrôler l'affichage de la modal
      showErrorModal: false,
      errorMessage: null,
      confirmNewPassword: "",
    };
  },
  computed: {
    // Pattern Regex
    patternRegex() {
      return this.regexPassword.toString().slice(1, -1);
    },
    // ValiderPassword
    validerPassword() {
      if (!this.regexPassword.test(this.user.password)) {
        return false;
      }

      return true;
    },
    // Valider Confirm Password
    validerConfirmPassword() {
      if ((this.confirmNewPassword === this.user.password) && this.validerPassword) {
        return true;
      }
      return false;
    },
    isLength() {
      return this.user.password.length >= 8;
    },
    isMaj() {
      const regex = /[A-Z]/;
      return regex.test(this.user.password);
    },
    isMin() {
      const regex = /[a-z]/;
      return regex.test(this.user.password);
    },
    isSpecial() {
      const regex = /[@$!%*?&]/;
      return regex.test(this.user.password);
    },
    isNumber() {
      const regex = /[0-9]/;
      return regex.test(this.user.password);
    },
  },

  methods: {
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    // SignUp method
    async signUp() {
      const url = this.getUrl();
      if (!this.validerConfirmPassword) {
        this.showErrorModal();
        this.errorMessage = "Les mots de passes ne correspondent pas !";
        return;
      }

      try {
        const { data } = await fetch(`${url}/users`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(this.user),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Si l'inscription réussit, vider les champs du formulaire et afficher la modal
        this.clearForm();
        this.openErrorModal();
        this.errorMessage =
          "Vérifiez vos emails afin de vous tenir informer de la suite";
      } catch (error) {
        this.openErrorModal();
        (this.errorMessage = "Erreur lors de la création du compte :"), error;
      }
    },
    // Close The modal
    closeModal() {
      // Masquer la modal et réinitialiser le formulaire lorsque l'utilisateur ferme la modal
      this.showModal = false;
      this.clearForm();
    },
    // clear all the form inputs
    clearForm() {
      // Réinitialiser les valeurs des champs du formulaire
      this.user.email = null;
      this.user.password = "";
      this.user.name = null;
      this.user.firstname = null;
      this.user.birthday = null;
      this.user.gender = null;
      this.confirmNewPassword = "";
    },
    // Regex
    validatePassword(password) {
      // Expression régulière pour valider le mot de passe
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    },
    openErrorModal() {
      this.showErrorModal = true;
    },
    //  Close Modal Password change
    closeErrorModal() {
      this.showErrorModal = false;

      this.errorMessage = "";
    },
  },
};
</script>
