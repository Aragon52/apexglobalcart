import { createFileRoute } from "@tanstack/react-router";

// Backups are produced by the offline script; the hosted app has no local file system to read.
export const Route = createFileRoute("/api/admin/backup-status")({
  server: {
    handlers: {
      GET: async () => Response.json({ success: false, message: "No backup manifest found yet." }),
    },
  },
});
