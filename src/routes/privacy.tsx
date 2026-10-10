import { createFileRoute, redirect } from "@tanstack/react-router";

// Duplicate address: send visitors and crawlers to the main page.
export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy-policy", statusCode: 301 });
  },
});
