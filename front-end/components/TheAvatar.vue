<template>
  <div class="avatar-picker bg-gray-200 rounded flex flex-col items-center">
    <div class="image-container" ref="imageContainer">
      <NuxtImg v-if="imageUrl"
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
    <input type="file" @change="onFileChange" class="mb-4 mt-4" accept="image/png, image/jpeg" />
    <input step="0.1" type="range" min="1" max="3" scale="0.1" v-model="zoom" />
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
      if (!/^image\//.test(file.type)) {
        alert(`${file.name} n'est pas une image !`)
        return
      }
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
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Définir la taille du canvas sur celle du conteneur
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Dessiner l'image du conteneur sur le canvas
        const imageElement = container.querySelector("img");
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        // Récupérer l'élément img d'origine pour obtenir le type MIME
        const originalImage = container.querySelector("img");
        const originalMimeType = originalImage.src.split(";")[0].split(":")[1];

        // Convertir le canvas en blob avec le type MIME d'origine
        canvas.toBlob((blob) => {
          if (blob) {
            // Émettre le blob avec l'événement avatarSaved
            this.$emit("avatarSaved", blob);
          } else {
            console.error("Conversion de l'image en blob a échoué.");
          }
        }, originalMimeType); // Utiliser le type MIME d'origine
      } catch (error) {
        console.error("Erreur lors de la capture de l'image :", error);
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
