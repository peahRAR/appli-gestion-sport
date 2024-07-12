<template>
  <div class="avatar-picker bg-gray-200 p-4 mb-4 rounded flex flex-col items-center">
    <div class="image-container">
      <img ref="image" :src="defaultImage" class="avatar-image w-full h-full" />
    </div>
    <input type="file" @change="onFileChange" class="max-w-full mb-4 mt-4" accept="image/png, image/jpeg" />
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
      croppedImageUrl: '', // Ajout d'une variable pour l'URL de l'image croppée
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      this.errorMessage = '';
      if (!/^image\//.test(file.type)) {
        this.errorMessage = `${file.name} n'est pas une image !`;
        this.resetImage();
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        this.errorMessage = `${file.name} est trop lourd, il ne doit pas dépasser 3 Mo !`;
        this.resetImage();
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.$refs.image.src = e.target.result;
        this.initCropper();
      };
      reader.readAsDataURL(file);
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
        // Récupérer les données du cropper après les ajustements
        const croppedCanvas = this.cropper.getCroppedCanvas({
          width: 100,
          height: 100,
        });

        // Convertir le canvas en Blob et mettre à jour l'URL de l'image croppée
        croppedCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          this.croppedImageUrl = url;

          // Émettre l'événement avec le blob croppé
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
  color: #f56565;
}
</style>
