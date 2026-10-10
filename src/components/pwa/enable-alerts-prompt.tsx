import { useEffect } from "react";
import { toast } from "sonner";
import { browserNotifyPermission, enableBrowserNotify } from "@/lib/browser-notify";
import { registerPushDevice } from "@/services/push-service";

const DISMISS_KEY = "browser_alerts_prompt_dismissed";

/** Asks once (per browser) whether to turn on browser alerts for deposits and withdrawals. */
export function EnableAlertsPrompt({ audience }: { audience: "admin" | "reseller" }) {
  useEffect(() => {
    if (browserNotifyPermission() === "granted") {
      void registerPushDevice(audience);
      return;
    }
    if (browserNotifyPermission() !== "default") return;
    if (window.self !== window.top) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => {
      toast("Turn on browser alerts?", {
        description:
          audience === "admin"
            ? "Get a notification on this device when a reseller requests a deposit or withdrawal."
            : "Get a notification on this device when your deposit or withdrawal is approved or rejected.",
        duration: 30_000,
        action: {
          label: "Turn on",
          onClick: () => {
            void enableBrowserNotify().then((result) => {
              localStorage.setItem(DISMISS_KEY, "1");
              if (result === "granted") void registerPushDevice(audience);
              if (result === "granted") toast.success("Browser alerts are on for this device.");
              else if (result === "denied") toast.error("Alerts are blocked. You can allow them in your browser's site settings.");
            });
          },
        },
        cancel: { label: "Not now", onClick: () => localStorage.setItem(DISMISS_KEY, "1") },
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [audience]);
  return null;
}
