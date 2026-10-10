/**
 * Single place that registers (or removes) the app service worker.
 * Never registers in dev, iframes, or Lovable preview hosts; `?sw=off` removes it.
 */

const SW_PATH = "/sw.js";

export function isServiceWorkerBlockedHost(hostname: string): boolean {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    hostname.endsWith(".lovable.app")
  );
}

async function unregisterAppWorkers(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith(SW_PATH) ?? true)
      .map((registration) => registration.unregister()),
  );
}

export function registerAppServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const refused =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isServiceWorkerBlockedHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (refused) {
    void unregisterAppWorkers();
    return;
  }

  navigator.serviceWorker.register(SW_PATH).catch(() => {
    // Offline support is optional; the site still works without it.
  });
}
