import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Tells people when they lose or regain connection, and refreshes data once back online. */
export function OnlineStatusNotifier() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOffline = () => {
      toast.warning("You're offline", {
        id: "network-status",
        description: "You can keep browsing saved pages. Messages you send will go out when you reconnect.",
      });
    };
    const handleOnline = () => {
      toast.success("You're back online", { id: "network-status", description: "Refreshing the latest data." });
      void queryClient.invalidateQueries();
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [queryClient]);

  return null;
}
