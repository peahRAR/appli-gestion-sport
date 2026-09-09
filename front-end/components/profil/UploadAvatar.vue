<template>
  <div class="avatar-picker bg-surface-2 p-4 mb-4 rounded-sm flex flex-col items-center">
    <div class="image-container">
      <img ref="image" :src="defaultImage" class="avatar-image w-full h-full" />
    </div>
    <input type="file" @change="onFileChange" class="max-w-full mb-4 mt-4" accept="image/*" />
    <div class="range w-2/6">
      <input v-if="isCropperInitialized" type="range" min="0.1" max="3" step="0.1" v-model="zoomLevel"
        @input="zoomImage" class="w-full mb-4 mt-2 accent-blue-500" />
    </div>
    <p>{{ message }}</p>
    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
  name: 'UploadAvatar',
  props: {
    message: String,
    userAvatar: String,
  },
  data() {
    return {
      cropper: null,
      errorMessage: '',
      defaultImage: this.userAvatar,
      zoomLevel: 1,
      isCropperInitialized: false,
      croppedImageUrl: '',
    };
  },
  methods: {
    async onFileChange(event) {
      const file = event.target.files[0];
      this.errorMessage = '';
      if (!file) return;

      // file.type peut être vide pour certains formats (ex. HEIC sur iOS
      // selon le contexte) — on ne rejette que si le navigateur affirme
      // explicitement que ce n'est PAS une image, pas quand il ne sait pas.
      if (file.type && !/^image\//.test(file.type)) {
        this.errorMessage = `${file.name} n'est pas une image.`;
        this.resetImage();
        return;
      }
      // Aucune contrainte réelle sur la taille du fichier d'origine :
      // l'image envoyée au serveur est recadrée à 100×100px (quelques Ko),
      // seule une limite large de bon sens évite de bloquer le navigateur
      // sur un fichier aberrant.
      if (file.size > 30 * 1024 * 1024) {
        this.errorMessage = `${file.name} est trop lourd (30 Mo max).`;
        this.resetImage();
        return;
      }

      try {
        const dataUrl = await this.fileToDataUrl(file);
        this.$refs.image.src = dataUrl;
        this.initCropper();
      } catch (e) {
        this.errorMessage = `Impossible de lire ${file.name} — essayez un autre format (jpg, png…).`;
        this.resetImage();
      }
    },
    // createImageBitmap() décode nativement plus de formats que <img src=dataURL>
    // (notamment HEIC/HEIF, les photos par défaut d'iPhone) sur les
    // navigateurs qui le supportent ; on retombe sur FileReader sinon.
    async fileToDataUrl(file) {
      if (window.createImageBitmap) {
        try {
          const bitmap = await createImageBitmap(file);
          return this.bitmapToDataUrl(bitmap);
        } catch {
          // Le navigateur ne sait pas décoder ce format via createImageBitmap
          // — on retente avec la lecture classique avant d'abandonner.
        }
      }
      return this.readFileAsDataUrl(file);
    },
    bitmapToDataUrl(bitmap) {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.92);
    },
    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    resetImage() {
      if (this.cropper) {
        this.cropper.destroy();
      }
      this.$refs.image.src = this.defaultImage;
      this.isCropperInitialized = false;
      this.initCropper();
    },
    initCropper() {
      if (this.cropper) {
        this.cropper.destroy();
      }
      this.cropper = new Cropper(this.$refs.image, {
        viewMode: 0,
        minContainerWidth: 100,
        minContainerHeight: 100,
        minCropBoxWidth: 100,
        minCropBoxHeight: 100,
        autoCropArea: 1,
        initialAspectRatio: 1,
        aspectRatio: 1,
        dragMode: 'move',
        background: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        ready: () => {
          this.isCropperInitialized = true;
          this.cropImage(); // Appeler cropImage lors de l'initialisation
        },
        crop: () => {
          this.cropImage(); // Appeler cropImage après chaque crop
        },
      });
    },
    zoomImage() {
      if (this.cropper) {
        this.cropper.zoomTo(this.zoomLevel);
        this.cropImage(); // Appeler cropImage après chaque zoom
      }
    },
    cropImage() {
      if (this.cropper) {
        const croppedCanvas = this.cropper.getCroppedCanvas({
          width: 100,
          height: 100,
        });
        croppedCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          this.croppedImageUrl = url;
          this.$emit('avatarSaved', blob);
        }, 'image/jpeg');
      }
    },
  },
  mounted() {
    this.initCropper();
  },
};
</script>

<style>
.avatar-picker .image-container {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
  position: relative;
}

.avatar-image {
  max-width: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.cropped-image-preview {
  max-width: 100px;
  max-height: 100px;
  border-radius: 50%;
}

.cropper-crop-box,
.cropper-view-box {
  border-radius: 50%;
}

.text-red-500 {
  color: var(--color-error);
}
</style>
