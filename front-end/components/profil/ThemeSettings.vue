<template>
  <div class="bg-white dark:bg-gray-800 rounded-sm p-4 mt-4 shadow-sm">
    <h2 class="text-lg font-bold mb-3 text-black dark:text-gray-100">Apparence</h2>
    <div class="flex gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="setMode(option.value)"
        :class="[
          'flex-1 py-2 px-3 rounded-sm font-semibold border transition',
          mode === option.value
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
      >
        {{ option.label }}
      </button>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
      "Système" suit automatiquement le réglage clair/sombre de votre appareil.
    </p>
  </div>
</template>

<script setup>
import { useTheme } from "~/composables/useTheme";

const { mode, setMode } = useTheme();

const options = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];
</script>
