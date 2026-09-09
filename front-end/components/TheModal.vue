<template>
  <transition name="modal">
    <div v-if="isOpen" @click="handleBackdropClick" ref="backdrop"
      class="fixed p-2 inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <!--
        Un seul conteneur défilant (le fond, ci-dessus) : `items-center` +
        `overflow-y-auto` sur un flex ET un second `overflow-y-auto` sur la
        boîte à l'intérieur créaient deux zones de scroll imbriquées. Sur
        Safari iOS, ce double scroll provoque un blocage aléatoire de l'écran
        quand on remonte dans une longue liste. `my-8 mx-auto` centre la
        boîte horizontalement sans dépendre du flex centering.
      -->
      <div class="relative w-full p-8 my-8 mx-auto bg-surface rounded-lg shadow-lg">
        <button v-if="showClose" @click="closeModal"
          class="absolute top-0 right-0 m-4 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 v-if="title" class="text-lg font-bold mb-4 text-center uppercase">
          {{ title }}
        </h2>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    showClose: { type: Boolean, default: true },  
    title: String,
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    handleBackdropClick(event) {
      if (this.$refs.backdrop === event.target) {
        this.$emit("close");
      }
    },
    handleBackdropClick(event) {
      if (this.$refs.backdrop === event.target) {
        this.$emit("close");
      }
    },
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.5s;
}

.modal-enter,
.modal-leave-to

/* .modal-leave-active below version 2.1.8 */
  {
  opacity: 0;
}
</style>
