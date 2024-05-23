<template>
  <div class="avatar-picker bg-gray-200 p-4 mb-4 rounded flex flex-col items-center">
    <div class="image-container" ref="imageContainer">
      <NuxtImg v-if="imageUrl" :src="imageUrl" :style="imageStyles" class="avatar-image" @touchstart="startDrag"
        @touchmove="onDrag" @touchend="stopDrag" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag" />
    </div>
    <div class="flex mt-2">
      <p class="mr-2">Zoom :</p>
      <input step="0.1" type="range" min="1" max="3" scale="0.1" v-model="zoom" />
    </div>
    <input type="file" @change="onFileChange" class="max-w-full mb-4 mt-4" accept="image/png, image/jpeg" />
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
  },
  data() {
    return {
      imageUrl: null,
      zoom: 1.8,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      imageX: 0,
      imageY: 0,
      selectedFile: null,
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
      if (!/^image\//.test(file.type)) {
        alert(`${file.name} n'est pas une image !`);
        return;
      }
      this.selectedFile = file;
      this.imageUrl = URL.createObjectURL(file);
      this.capturedAndEmit(file);
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
    stopDrag() {
      this.dragging = false;
      if (this.selectedFile) {
        this.capturedAndEmit(this.selectedFile);
      }
    },
    capturedAndEmit(file) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              this.$emit('avatarSaved', blob);
            });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors de la capture de l\'image :', error);
      }
    }
  }
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
