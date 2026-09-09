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
        <p class="text-xs text-text-muted mt-1">
          Sur iPhone, cela nécessite d'avoir ajouté l'application à l'écran d'accueil.
        </p>
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

    <!-- TEMP DEBUG PANEL — à retirer une fois le problème identifié -->
    <pre class="mt-4 p-2 bg-black text-green-400 text-[10px] whitespace-pre-wrap rounded-sm">{{ debugInfo }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePushNotifications } from "~/composables/usePushNotifications";

const { isSupported, permission, enabled, loading, error, isIosNonStandalone, toggle } =
  usePushNotifications();

const debugInfo = ref("chargement du debug...");

onMounted(async () => {
  const lines = [];
  lines.push("standalone=" + (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone));
  lines.push("serviceWorker in navigator=" + ("serviceWorker" in navigator));
  lines.push("PushManager in window=" + ("PushManager" in window));
  lines.push("Notification.permission=" + (typeof Notification !== "undefined" ? Notification.permission : "n/a"));
  lines.push("navigator.serviceWorker.controller=" + (navigator.serviceWorker?.controller ? navigator.serviceWorker.controller.scriptURL : "aucun"));

  const { $pwa } = useNuxtApp();
  lines.push("--- état @vite-pwa/nuxt ---");
  lines.push("pwa.registrationError=" + $pwa?.registrationError);
  lines.push("pwa.swActivated=" + $pwa?.swActivated);
  lines.push("pwa.offlineReady=" + $pwa?.offlineReady);
  lines.push("pwa.needRefresh=" + $pwa?.needRefresh);

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    lines.push("--- getRegistrations() ---");
    lines.push("count=" + regs.length);
    regs.forEach((r, i) => {
      lines.push(`  [${i}] scope=${r.scope}`);
      lines.push(`  [${i}] active=${r.active ? r.active.scriptURL + " state=" + r.active.state : "aucun"}`);
      lines.push(`  [${i}] waiting=${r.waiting ? r.waiting.scriptURL + " state=" + r.waiting.state : "aucun"}`);
      lines.push(`  [${i}] installing=${r.installing ? r.installing.scriptURL + " state=" + r.installing.state : "aucun"}`);
    });
  } catch (e) {
    lines.push("getRegistrations() ERROR: " + (e?.message || e));
  }

  lines.push("--- test manuel navigator.serviceWorker.register('/sw.js') ---");
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    lines.push("register() OK, scope=" + reg.scope);
  } catch (e) {
    lines.push("register() ERROR: " + (e?.name || "") + ": " + (e?.message || e));
  }

  debugInfo.value = lines.join("\n");
});
</script>
