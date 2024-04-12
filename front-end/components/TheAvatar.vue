<template>
  <div class="avatar-picker bg-gray-200 rounded flex flex-col items-center">
    <div class="image-container " ref="imageContainer">
      <img
        :src="imageUrl"
        :style="imageStyles"
        class="avatar-image"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="stopDrag"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
      />
    </div>
    <input type="file" @change="onFileChange" class="mb-4 mt-4"/>
    <input step="0.1" type="range" min="1" max="3" scale="0.1" v-model="zoom">
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: null,
      zoom: 1,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      imageX: 0,
      imageY: 0,
    };
  },
  computed: {
    imageStyles() {
      return {
        transform: `translate(${this.imageX}px, ${this.imageY}px) scale(${this.zoom})`,
      };
    },
  },
  methods: {
    async onFileChange(event) {
      const file = event.target.files[0];
      this.imageUrl = URL.createObjectURL(file);
      await this.capturedAndEmit();
    },
    startDrag(event) {
      event.preventDefault(); // Empêche le défilement de la page sur les smartphones
      const touch = event.touches ? event.touches[0] : event;
      this.dragging = true;
      this.dragStartX = touch.clientX - this.imageX;
      this.dragStartY = touch.clientY - this.imageY;
    },
    onDrag(event) {
      if (this.dragging) {
        const touch = event.touches ? event.touches[0] : event;
        this.imageX = touch.clientX - this.dragStartX;
        this.imageY = touch.clientY - this.dragStartY;
      }
    },
    async stopDrag() {
      this.dragging = false;
      this.capturedAndEmit();
    },
    async capturedAndEmit() {
      try {
        const container = this.$refs.imageContainer;
        const html2canvas = (await import("html2canvas")).default;

        html2canvas(container).then((canvas) => {
          canvas.toBlob((blob) => {
            if (blob) {
              // Créer un objet Blob à partir de l'image
              this.$emit("avatarSaved", blob);
            } else {
              console.error("Conversion de l'image en blob a échoué.");
            }
          }, "image/png"); // Spécifiez le type MIME de l'image
        });
      } catch (error) {
        console.error("Erreur lors de l'importation de html2canvas :", error);
      }
    },
  },
};
</script>

<style>
.avatar-picker .image-container {
  overflow: hidden;
  margin: auto;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  padding: 1%;
  border: 2px;
  border-style: ridge;
  border-color: black;
}
.avatar-image {
  cursor: grab;
  transition: transform 0.2s ease;
}
</style>
