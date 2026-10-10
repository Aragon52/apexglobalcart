/**
 * Browser (system) notifications for deposit and withdrawal events.
 * Shown while the portal is open in any tab or as an installed app, even when it's in the background.
 */

const ICON = "/icons/icon-192.png";

export function browserNotifySupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function browserNotifyPermission(): NotificationPermission | "unsupported" {
  return browserNotifySupported() ? Notification.permission : "unsupported";
}

/** Must be called from a click. Returns false inside embedded previews, where browsers block the prompt. */
export async function enableBrowserNotify(): Promise<NotificationPermission | "unsupported" | "embedded"> {
  if (!browserNotifySupported()) return "unsupported";
  if (window.self !== window.top) return "embedded";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function showBrowserNotification(title: string, body: string, url?: string): Promise<void> {
  if (!browserNotifySupported() || Notification.permission !== "granted") return;
  const options: NotificationOptions = { body, icon: ICON, badge: ICON, tag: `${title}-${body}`.slice(0, 64), data: { url } };
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (url) window.location.assign(url);
      n.close();
    };
  } catch {
    // Notifications are optional; the in-app toast still shows.
  }
}
