<template>
  <div
    v-if="pwa?.needRefresh"
    class="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto z-50 max-w-sm mx-auto sm:mx-0 rounded-xl border border-border bg-surface shadow-lg p-4 flex items-center gap-3"
  >
    <span class="text-sm text-text flex-1">Nouvelle version disponible.</span>
    <button
      type="button"
      class="px-3 py-1.5 rounded-md bg-accent text-accent-fg text-sm font-semibold"
      @click="reload"
    >
      Recharger
    </button>
    <button
      type="button"
      class="text-text-muted text-sm"
      @click="pwa?.cancelPrompt()"
      aria-label="Ignorer"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
const { $pwa } = useNuxtApp()
const pwa = $pwa

function reload() {
  pwa?.updateServiceWorker(true)
}
</script>
