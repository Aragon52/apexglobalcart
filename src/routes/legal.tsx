import { createFileRoute, redirect } from "@tanstack/react-router";

// Duplicate address: send visitors and crawlers to the main page.
export const Route = createFileRoute("/legal")({
  beforeLoad: () => {
    throw redirect({ to: "/legal-notice", statusCode: 301 });
  },
});
