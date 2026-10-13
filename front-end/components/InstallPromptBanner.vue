<template>
  <div
    v-if="showBanner"
    class="fixed bottom-24 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto z-50 max-w-sm mx-auto sm:mx-0 rounded-xl border border-border bg-surface shadow-lg p-4"
  >
    <div class="flex items-center gap-3">
      <span class="text-sm text-text flex-1">Ajoute l'application à ton écran d'accueil pour un accès plus rapide.</span>
      <button
        type="button"
        class="px-3 py-1.5 rounded-md bg-accent text-accent-fg text-sm font-semibold shrink-0"
        @click="onInstallClick"
      >
        Ajouter
      </button>
      <button
        type="button"
        class="text-text-muted text-sm shrink-0"
        @click="dismissLater"
        aria-label="Plus tard"
      >
        ✕
      </button>
    </div>
    <button
      type="button"
      class="mt-2 text-xs text-text-muted underline"
      @click="dismissForever"
    >
      Ne plus jamais afficher
    </button>
  </div>

  <!-- Instructions manuelles (iPhone/iPad) : Apple n'expose aucune API pour
       déclencher l'installation depuis le site, contrairement à
       beforeinstallprompt sur Android/desktop. -->
  <TheModal :isOpen="showInstallHelpModal" title="Ajouter à l'écran d'accueil" @close="showInstallHelpModal = false">
    <p v-if="!isIosSafari" class="mb-3">
      Sur iPhone, l'ajout à l'écran d'accueil n'est possible que depuis <strong>Safari</strong>.
      Ouvre ce site dans Safari, puis suis les étapes ci-dessous.
    </p>
    <ol class="list-decimal list-inside space-y-2">
      <li>Appuie sur le bouton <strong>Partager</strong> <span aria-hidden="true">(⬆️, en bas de Safari)</span></li>
      <li>Fais défiler et sélectionne <strong>"Sur l'écran d'accueil"</strong></li>
      <li>Confirme en appuyant sur <strong>"Ajouter"</strong></li>
    </ol>
  </TheModal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const NEVER_SHOW_KEY = 'installPromptNeverShow'
const DISMISSED_UNTIL_KEY = 'installPromptDismissedUntil'
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // ~30 jours

const { $pwa } = useNuxtApp()

const isIos = ref(false)
const isIosSafari = ref(false)
const isStandalone = ref(false)
const neverShow = ref(false)
const inCooldown = ref(false)
const showInstallHelpModal = ref(false)

onMounted(() => {
  const ua = window.navigator.userAgent || ''
  isIos.value = /iP(hone|od|ad)/.test(ua)
  // Chrome/Firefox sur iOS utilisent bien le moteur WebKit mais leur menu de
  // partage n'installe pas toujours une vraie PWA en mode standalone — on ne
  // peut compter que sur Safari pour ça.
  isIosSafari.value = isIos.value && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  neverShow.value = window.localStorage.getItem(NEVER_SHOW_KEY) === '1'
  const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || 0)
  inCooldown.value = Date.now() < dismissedUntil
})

const showBanner = computed(() => {
  if (isStandalone.value || neverShow.value || inCooldown.value) return false
  return isIos.value || !!$pwa?.showInstallPrompt
})

async function onInstallClick() {
  if (isIos.value) {
    showInstallHelpModal.value = true
    return
  }
  await $pwa?.install()
}

function dismissLater() {
  window.localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_COOLDOWN_MS))
  inCooldown.value = true
}

function dismissForever() {
  window.localStorage.setItem(NEVER_SHOW_KEY, '1')
  neverShow.value = true
}
</script>
