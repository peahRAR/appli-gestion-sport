<template>
  <div class="bg-surface rounded-sm p-4 mt-4 shadow-sm">
    <h2 class="text-lg font-bold mb-3 text-text">Apparence</h2>
    <div class="flex gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="setMode(option.value)"
        :class="[
          'flex-1 py-2 px-3 rounded-sm font-semibold border transition',
          mode === option.value
            ? 'bg-accent border-accent text-accent-fg'
            : 'bg-surface-2 border-border text-text hover:bg-bg',
        ]"
      >
        {{ option.label }}
      </button>
    </div>
    <p class="text-sm text-text-muted mt-2">
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
