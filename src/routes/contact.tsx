import { createFileRoute, redirect } from "@tanstack/react-router";

// Duplicate address: send visitors and crawlers to the main page.
export const Route = createFileRoute("/contact")({
  beforeLoad: () => {
    throw redirect({ to: "/contact-us", statusCode: 301 });
  },
});
