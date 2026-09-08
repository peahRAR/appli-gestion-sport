<template>
  <button
    v-if="isStandalone"
    type="button"
    class="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text border border-border rounded-full px-3 py-1"
    @click="$emit('refresh')"
  >
    <Icon name="tabler:refresh" class="text-sm" />
    Actualiser
  </button>
</template>

<script>
// Manual refresh, shown only in standalone (installed PWA) mode as a safety
// net alongside the automatic foreground refresh — see
// plugins/refetch-on-foreground.client.ts.
export default {
  name: "StandaloneRefreshButton",
  emits: ["refresh"],
  data() {
    return { isStandalone: false };
  },
  mounted() {
    try {
      this.isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true; // iOS Safari
    } catch {
      this.isStandalone = false;
    }
  },
};
</script>
