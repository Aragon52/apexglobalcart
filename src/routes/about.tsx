import { createFileRoute, redirect } from "@tanstack/react-router";

// Duplicate address: send visitors and crawlers to the main page.
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ to: "/about-us", statusCode: 301 });
  },
});
