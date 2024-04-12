<template>
  <transition name="modal">
    <div
      v-if="isOpen"
      @click="handleBackdropClick"
      ref="backdrop"
      class="fixed p-2 inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="relative p-8 mx-2 max-w-lg mx-auto bg-white rounded-lg shadow-lg mt-20"
      >
        <button
          @click="closeModal"
          class="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <svg
            class="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
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

/* .modal-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
