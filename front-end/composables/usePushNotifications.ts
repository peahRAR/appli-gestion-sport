import { ref, onMounted } from "vue";

// Converts the VAPID public key (URL-safe base64) into the Uint8Array shape
// the Push API expects for applicationServerKey.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// TEMP DEBUG helper: races a promise against a timeout so a hang reports
// clearly instead of leaving the UI stuck with no signal.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT: ${label} n'a jamais résolu après ${ms}ms`)), ms)),
  ]);
}

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const isSupported = ref(false);
  const permission = ref("default"); // "default" | "granted" | "denied"
  const enabled = ref(false); // server-side preference (push_notifications_enabled)
  const loading = ref(false);
  const error = ref("");
  // iOS Safari only supports Web Push once installed to the home screen (iOS 16.4+).
  const isIosNonStandalone = ref(false);

  function getUrl() {
    const config = useRuntimeConfig();
    return config.public.siteUrl;
  }

  onMounted(async () => {
    isSupported.value =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    if (isSupported.value) {
      permission.value = Notification.permission;

      // The toggle reflects THIS device's actual subscription, not the
      // server-side preference (which defaults to true for every account —
      // trusting it here would show "activé" even for a device that was
      // never actually granted permission or subscribed).
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        enabled.value = !!subscription;
      } catch {
        enabled.value = false;
      }
    }

    const ua = window.navigator.userAgent || "";
    const isIos = /iP(hone|od|ad)/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    isIosNonStandalone.value = isIos && !isStandalone;
  });

  async function subscribe() {
    error.value = "";
    loading.value = true;
    try {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem("accessToken");
      if (!userId || !token) throw new Error("Non connecté.");

      const perm = await Notification.requestPermission();
      permission.value = perm;
      alert("[debug 1] permission=" + perm);
      if (perm !== "granted") {
        throw new Error("Permission refusée par le navigateur.");
      }

      alert("[debug 2] appel navigator.serviceWorker.ready...");
      const registration = await withTimeout(navigator.serviceWorker.ready, 8000, "serviceWorker.ready");
      alert("[debug 3] SW ready OK, scope=" + registration.scope + " active=" + !!registration.active);

      let subscription = await withTimeout(
        registration.pushManager.getSubscription(),
        8000,
        "getSubscription"
      );
      alert("[debug 4] getSubscription -> " + (subscription ? "existe deja" : "aucune"));

      if (!subscription) {
        const config = useRuntimeConfig();
        alert("[debug 5] appel subscribe() avec cle=" + String(config.public.vapidPublicKey).slice(0, 15) + "...");
        subscription = await withTimeout(
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(config.public.vapidPublicKey),
          }),
          8000,
          "pushManager.subscribe"
        );
        alert("[debug 6] subscribe() OK");
      }

      const url = getUrl();
      const subscribeRes = await fetch(`${url}/users/${userId}/push-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!subscribeRes.ok) throw new Error(`Échec de l'enregistrement côté serveur (${subscribeRes.status}).`);

      const prefRes = await fetch(`${url}/users/${userId}/push-preference`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: true }),
      });
      if (!prefRes.ok) throw new Error(`Échec de la préférence côté serveur (${prefRes.status}).`);

      enabled.value = true;
    } catch (e) {
      alert("[debug ERREUR] " + (e?.name || "") + ": " + (e?.message || e));
      error.value = e?.message || "Erreur lors de l'activation des notifications.";
      enabled.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function unsubscribe() {
    error.value = "";
    loading.value = true;
    try {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem("accessToken");
      const url = getUrl();

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          if (userId && token) {
            await fetch(`${url}/users/${userId}/push-subscriptions`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            });
          }
          await subscription.unsubscribe();
        }
      }

      if (userId && token) {
        await fetch(`${url}/users/${userId}/push-preference`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ enabled: false }),
        });
      }

      enabled.value = false;
    } catch (e) {
      error.value = e?.message || "Erreur lors de la désactivation des notifications.";
    } finally {
      loading.value = false;
    }
  }

  async function toggle(value) {
    if (value) await subscribe();
    else await unsubscribe();
  }

  return {
    isSupported,
    permission,
    enabled,
    loading,
    error,
    isIosNonStandalone,
    toggle,
  };
}
