<template>
  <div class="bg-surface rounded-sm p-4 mt-4 shadow-sm">
    <h2 class="text-lg font-bold mb-3 text-text">Notifications</h2>

    <div v-if="!isSupported" class="text-sm text-text-muted">
      Les notifications push ne sont pas prises en charge par ce navigateur.
    </div>

    <div v-else-if="isIosNonStandalone" class="text-sm text-text-muted">
      Ajoutez l'application à votre écran d'accueil (bouton Partager → « Sur l'écran d'accueil »)
      pour pouvoir recevoir des notifications.
    </div>

    <div v-else class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm text-text">Recevoir une notification quand un nouveau cours est ajouté.</p>
        <p v-if="permission === 'denied'" class="text-xs text-red-500 mt-1">
          Les notifications sont bloquées pour ce site dans les réglages de votre navigateur.
        </p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="enabled"
          :disabled="loading || permission === 'denied'"
          @change="toggle($event.target.checked)"
        />
        <div
          class="w-11 h-6 bg-surface-2 rounded-full peer peer-checked:bg-accent transition-colors border border-border"
        ></div>
        <div
          class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"
        ></div>
      </label>
    </div>

    <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { usePushNotifications } from "~/composables/usePushNotifications";

const props = defineProps({
  user: { type: Object, default: () => ({}) },
});

const { isSupported, permission, enabled, loading, error, isIosNonStandalone, setInitialEnabled, toggle } =
  usePushNotifications();

watch(
  () => props.user?.push_notifications_enabled,
  (value) => {
    if (typeof value === "boolean") setInitialEnabled(value);
  },
  { immediate: true }
);
</script>
