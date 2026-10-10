import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ResellerProvider } from "@/lib/reseller-context";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { ProductsProvider } from "@/lib/products-context";
import { ProductSyncProvider } from "@/context/ProductSyncContext";
import { SeasonalThemeProvider } from "@/lib/seasonal-theme-context";
import { ErrorBoundary, ErrorFallbackView } from "@/components/ErrorBoundary";
import { initPWAInstall } from "@/lib/pwa-install";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <ErrorFallbackView
      error={error}
      boundaryName="tanstack_root_error_component"
      title="This page couldn't load"
      description="Something went wrong on our end while loading this page. You can try refreshing or return home."
      reset={() => {
        router.invalidate();
        reset();
      }}
      fullScreen
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B1B3F" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Apex Global Cart" },
      { title: "Apex Global Cart - Simplified and Enhanced Commerce System for Everyone Everything Everywhere" },
      {
        name: "description",
        content:
          "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Cart, with secure checkout and worldwide delivery.",
      },
      { name: "keywords", content: "online marketplace, global shopping, ecommerce, products, reseller portal" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Apex Global Cart - Simplified and Enhanced Commerce System for Everyone Everything Everywhere" },
      {
        property: "og:description",
        content:
          "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Cart, with secure checkout and worldwide delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://apexglobalonlineshop.com/" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-customer.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart online marketplace" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-customer.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-180.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initPWAInstall();
    registerAppServiceWorker();
  }, []);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Apex Global Cart",
        url: "https://apexglobalonlineshop.com/",
        logo: "https://apexglobalonlineshop.com/brand/logo-header.svg",
        contactPoint: {
          "@type": "ContactPoint",
          url: "https://apexglobalonlineshop.com/contact",
          contactType: "customer support",
        },
      },
      {
        "@type": "WebSite",
        name: "Apex Global Cart",
        url: "https://apexglobalonlineshop.com/",
        description: "Global online marketplace for products, categories, and reseller stores.",
      },
    ],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ErrorBoundary boundaryName="root_providers" fullScreen>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              <ProductsProvider>
                <ProductSyncProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <ResellerProvider>
                        <SeasonalThemeProvider>
                          <CustomerAuthProvider>
                            <AdminAuthProvider>
                              <Toaster />
                              <Sonner />
                              <ErrorBoundary boundaryName="router_outlet" fullScreen={false}>
                                <Outlet />
                              </ErrorBoundary>
                            </AdminAuthProvider>
                          </CustomerAuthProvider>
                        </SeasonalThemeProvider>
                      </ResellerProvider>
                    </WishlistProvider>
                  </CartProvider>
                </ProductSyncProvider>
              </ProductsProvider>
            </TooltipProvider>
          </ThemeProvider>
        </I18nextProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
