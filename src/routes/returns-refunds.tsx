import { createFileRoute, redirect } from "@tanstack/react-router";

// Duplicate address: send visitors and crawlers to the main page.
export const Route = createFileRoute("/returns-refunds")({
  beforeLoad: () => {
    throw redirect({ to: "/refund-policy", statusCode: 301 });
  },
});
