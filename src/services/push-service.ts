import { supabase } from "@/lib/supabase";

const appId = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID as string | undefined;
const vapidKey = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY as string | undefined;
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY as string | undefined) ?? "",
  projectId: (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID as string | undefined) ?? "",
  appId: appId ?? "",
  messagingSenderId: appId?.split(":")[1] ?? "",
};

/** Registers this device for push alerts (works even when the site is closed). Call after permission is granted. */
export async function registerPushDevice(portal: "admin" | "reseller"): Promise<boolean> {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !vapidKey || !firebaseConfig.messagingSenderId) return false;
    if (typeof window === "undefined" || window.self !== window.top) return false;
    if (!("Notification" in window) || Notification.permission !== "granted") return false;
    const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
    if (!(await isSupported())) return false;
    const { initializeApp, getApps } = await import("firebase/app");
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const query = new URLSearchParams(firebaseConfig).toString();
    // Own scope so it never clashes with the site's offline worker.
    const serviceWorkerRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`, {
      scope: "/firebase-cloud-messaging-push-scope",
    });
    const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration });
    if (!token) return false;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    await supabase.from("push_tokens").upsert({ token, portal, user_id: data.session.user.id }, { onConflict: "token" });
    return true;
  } catch {
    return false;
  }
}

/** Asks the server to push a deposit/withdrawal alert. The server decides who receives it. */
export async function notifyFinancialRequest(table: "deposit_requests" | "withdrawal_requests", id: string | undefined): Promise<void> {
  if (!id) return;
  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) return;
    await fetch("/api/push/financial", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ table, id }),
    });
  } catch {
    // Push is best-effort; the request itself is already saved.
  }
}
