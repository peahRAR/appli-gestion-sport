<template>
  <div class="loading-dots">
    <div class="dot" v-for="(dot, index) in dots" :key="index" :style="{ animationDelay: `${index * 0.1}s` }"></div>
  </div>
</template>

<style>
.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  min-height: 80vh;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #333;
  border-radius: 50%;
  margin: 0 5px;
  animation: jump 1s infinite;
}

@keyframes jump {
  0%, 50%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-10px);
  }
}
</style>

<script>
export default {
  data() {
    return {
      dots: [1, 2, 3] // Nombre de points de chargement
    };
  }
};
</script>
