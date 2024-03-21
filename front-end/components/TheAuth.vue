<template>
  <div class="background container mx-auto">

    <div class="border rounded-lg p-4 ">

      <p class="font-bold text-2xl mb-4">
        {{ openLabel }}
      </p>
      <hr class="separator mb-4" />


      <keep-alive>
        <component v-bind:is="component"></component>
      </keep-alive>
      <p class=" mt-4 text-center underline cursor-pointer" v-on:click="changeTarget()">
        {{ buttonLabel }}
      </p>

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