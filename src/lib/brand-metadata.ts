/**
 * Brand Metadata Configuration
 * Centralized brand, OG, and PWA metadata across portals
 */

export type Portal = 'customer' | 'reseller';

export interface BrandConfig {
  title: string;
  description: string;
  themeColor: string;
  ogImage: string;
  ogImageAlt: string;
  manifestPath: string;
  keywords: string[];
}

const brandConfigs: Record<Portal, BrandConfig> = {
  customer: {
    title: 'Apex Global Cart | Shop verified reseller stores worldwide',
    description:
      'Shop premium products from verified sellers worldwide. Discover reseller stores, enjoy secure checkout, and get world-class customer support.',
    themeColor: '#0B1B3F',
    ogImage: '/brand/og-customer.png',
    ogImageAlt: 'Apex Global Cart online marketplace',
    manifestPath: '/manifest.json',
    keywords: [
      'online marketplace',
      'global shopping',
      'ecommerce',
      'products',
      'reseller portal',
    ],
  },
  reseller: {
    title: 'Apex Global Cart Reseller Portal | Grow your global store',
    description:
      'Manage your online store, track orders, boost sales with our marketing tools, and grow your global business on Apex Global Cart.',
    themeColor: '#0B1B3F',
    ogImage: '/brand/og-reseller.png',
    ogImageAlt: 'Apex Global Cart Reseller Portal',
    manifestPath: '/manifest-reseller.json',
    keywords: [
      'reseller platform',
      'seller dashboard',
      'ecommerce business',
      'store management',
      'global marketplace',
    ],
  },
};

export function getBrandConfig(portal: Portal = 'customer'): BrandConfig {
  return brandConfigs[portal];
}

export function generateMetaTags(
  portal: Portal = 'customer',
  overrides?: Partial<BrandConfig>
) {
  const config = { ...getBrandConfig(portal), ...overrides };

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords.join(', '),
    themeColor: config.themeColor,
    openGraph: {
      title: config.title,
      description: config.description,
      image: config.ogImage,
      imageAlt: config.ogImageAlt,
      type: 'website' as const,
      url: portal === 'reseller' ? 'https://reseller.apexglobalonlineshop.com/' : 'https://apexglobalonlineshop.com/',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: config.title,
      description: config.description,
      image: config.ogImage,
    },
  };
}

export function generateLinkTags(portal: Portal = 'customer') {
  const config = getBrandConfig(portal);

  return [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/brand/icon-apple-touch.svg' },
    { rel: 'manifest', href: config.manifestPath },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    },
  ];
}
