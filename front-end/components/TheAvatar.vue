<template>
  <div class="avatar-picker">
    <div v-if="imageUrl" class="image-container" ref="imageContainer">
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
    <input type="file" @change="onFileChange" />
    <input type="range" min="1" max="3" scale="0.1" v-model="zoom">
    
  </div>
</template>

<script>
import html2canvas from "html2canvas";
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
    onFileChange(event) {
      const file = event.target.files[0];
      this.imageUrl = URL.createObjectURL(file);
      this.$emit("avatarSaved", this.imageUrl);
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
      const container = this.$refs.imageContainer; // Assurez-vous d'ajouter une référence au conteneur de l'image dans le template
      const html2canvas = (await import("html2canvas")).default;
      html2canvas(container).then((canvas) => {
        // Convertir le canvas en une URL d'image
        const image = canvas.toDataURL("image/png");

        // Émettre l'événement avec l'URL de l'image en tant que payload
        this.$emit("avatarSaved", image);
      });
    },
  },
};
</script>

<style>
.avatar-picker .image-container {
  overflow: hidden;
  width: 200px;
  height: 200px;
  border-radius: 50%;
}
.avatar-image {
  cursor: grab;
  transition: transform 0.2s ease;
}
</style>
