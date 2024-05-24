<template>
  <div class="background min-h-screen container mx-auto py-4">

    <div class="border border-gray-400 border-opacity-50 rounded-lg p-4 mx-4 ">

      <p class="font-bold text-2xl mb-4">
        {{ openLabel }}
      </p>
      <div class="mb-4 border-b border-gray-400 border-opacity-50" ></div>


      <keep-alive>
        <component v-bind:is="component"></component>
      </keep-alive>
      <div class="w-full flex justify-center">
        <p class=" mt-4 text-center w-full inline underline cursor-pointer" v-on:click="changeTarget()">
          {{ buttonLabel }}
        </p>
      </div>

    </div>
  </div>

</template>

<script>

import TheLogin from './TheLogin.vue'
import TheRegister from './TheRegister.vue'

export default {

  components: { TheLogin, TheRegister },

  data() {
    return {
      component: "TheLogin",
    };
  },
  computed: {
    buttonLabel() {
      return this.component === "TheLogin" ? "S'inscrire" : "Connexion";
    },
    openLabel() {
      return this.component === "TheLogin" ? "Connexion" : "S'inscrire";
    },
  },
  methods: {
    changeTarget() {
      if (this.component === "TheLogin") {
        this.component = "TheRegister";
        return;
      }
      this.component = "TheLogin";
    },
  },
};
</script>