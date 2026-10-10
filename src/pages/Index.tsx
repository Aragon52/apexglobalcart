import React from "react";
import SEO from "@/components/SEO";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCategories } from "@/components/home/ProductCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { DealsOfTheDay } from "@/components/home/DealsOfTheDay";
import { BestSelling } from "@/components/home/BestSelling";
import { CategorySection } from "@/components/home/CategorySection";
import { FeatureCategories } from "@/components/home/FeatureCategories";
import { FeaturedBrands } from "@/components/home/FeaturedBrands";
import { PreOrderBanner } from "@/components/home/PreOrderBanner";
import { AppDownloadBanner } from "@/components/home/AppDownloadBanner";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { MoreProducts } from "@/components/home/MoreProducts";
import { SeasonalDecorations } from "@/components/home/SeasonalDecorations";
import { TrustSection } from "@/components/home/TrustSection";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/lib/products-context-hooks";

export default function Index() {
  const { t } = useTranslation();
  const { categories } = useProducts();
  
  const targetCategoryNames = [
    "electronics",
    "accessories",
    "automotive parts & accessories",
    "fragrances",
    "bags & backpacks"
  ];

  const safeCategories = (categories || []).filter(c => Boolean(c && c.name && c.slug));

  // Filter categories that match the target names (case-insensitive)
  const matchedCategories = safeCategories.filter(cat => 
    targetCategoryNames.some(target => cat.name.toLowerCase().includes(target))
  );

  // If we still didn't find enough matches, pad with other categories
  const topCategories = matchedCategories.length >= 5 
    ? matchedCategories.slice(0, 5) 
    : [...matchedCategories, ...safeCategories.filter(c => !matchedCategories.some(mc => mc.id === c.id))].slice(0, 5);


  const gradients = [
    "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
    "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
    "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
    "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
    "bg-gradient-to-br from-indigo-500/10 to-cyan-500/10"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Apex Global Cart - Simplified and Enhanced Commerce System for Everyone Everything Everywhere"
        description="Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Cart, with secure checkout and worldwide delivery."
        canonical="https://apexglobalonlineshop.com/"
        ogType="website"
      />
      <h1 className="sr-only">Apex Global Cart — shop verified reseller stores worldwide</h1>
      <SeasonalDecorations />
      <HeroBanner />
      <section aria-labelledby="about-app" className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-3">
          <h2 id="about-app" className="text-2xl font-bold text-foreground">Welcome to Apex Global Cart</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Apex Global Cart is an online marketplace where shoppers buy electronics, fashion, home, beauty and sports products from verified reseller stores. Resellers use Apex Global Cart to open their own online shop, choose products from our catalogue and manage their orders. You can browse every product without an account; you only sign in to place orders, track deliveries or run a reseller shop.
          </p>
          <p className="text-sm text-muted-foreground">
            Sign in with email or with Google. We only use your name, email and profile picture to create and secure your account. Read our{" "}
            <a href="/privacy-policy" className="text-primary underline">privacy policy</a> and{" "}
            <a href="/terms-of-service" className="text-primary underline">terms of service</a>.
          </p>
        </div>
      </section>
      <TrustSection />
      <ProductCategories />
      <FeaturedProducts />
      <DealsOfTheDay />
      <BestSelling />
      {topCategories.map((cat, index) => (
        <CategorySection 
          key={cat.id} 
          title={t(`common.${cat.slug}`, { defaultValue: cat.name })} 
          categorySlug={cat.slug} 
          bgGradient={gradients[index % gradients.length]} 
        />
      ))}
      <FeatureCategories />
      <FeaturedBrands />
      <PreOrderBanner />
      <FeaturedProducts />
      <AppDownloadBanner />
      <RecentlyViewed />
      <MoreProducts />
    </div>
  );
}
