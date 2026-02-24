"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { BrandWaveLoader } from "@/components/shared/brand-wave-loader";
import { usePortfolio } from "@/services/portfolio";
import { Camera } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { useDataSourceStore } from "@/stores/admin-settings-store";

interface PortfolioPhoto {
  url?: string;
  r2Key?: string;
  width?: number;
  height?: number;
}

interface PortfolioApiItem {
  slug: string;
  title: string;
  category: string;
  description?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  photos?: PortfolioPhoto[];
}

interface PortfolioViewItem {
  slug: string;
  title: string;
  category: string;
  location: string;
  image: string;
  aspect: "portrait" | "landscape";
}

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { dataSource, hasHydrated } = useDataSourceStore();
  const { data: apiItems = [], isLoading } = usePortfolio();
  const showInitialLoader =
    !hasHydrated || (dataSource === "api" && isLoading);

  const items = useMemo<PortfolioViewItem[]>(() => {
    return (apiItems as PortfolioApiItem[]).map((item, index) => {
      // Determine aspect from cover photo dimensions if available
      const coverPhoto = item.photos?.[0];
      let aspect: "portrait" | "landscape" = "portrait";
      if (coverPhoto?.width && coverPhoto?.height) {
        aspect = coverPhoto.width > coverPhoto.height ? "landscape" : "portrait";
      } else {
        // Alternate for mock data / items without dimensions
        const pattern = [0, 1, 0, 1, 1, 0]; // mixed pattern
        aspect = pattern[index % pattern.length] ? "landscape" : "portrait";
      }

      return {
        slug: item.slug,
        title: item.title,
        category: item.category,
        location: item.description?.split(",").pop()?.trim() || "Pacific Northwest",
        image: resolveMediaUrl(
          item.coverImageUrl ||
            item.coverImageKey ||
            coverPhoto?.url ||
            coverPhoto?.r2Key ||
            "",
        ),
        aspect,
      };
    });
  }, [apiItems]);

  const categories = useMemo(() => {
    if (!items.length) return ["All"];
    const unique = [...new Set(items.map((i) => i.category))].filter(Boolean) as string[];
    return ["All", ...unique];
  }, [items]);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Portfolio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-brand-main mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.1" }}
          >
            A Collection of Love Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-brand-main/60 max-w-xl mx-auto"
            style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
          >
            Each session is a chapter. Browse through moments of joy, love, and
            celebration captured across the Pacific Northwest and beyond.
          </motion.p>
        </div>
      </section>

      {/* Filter */}
      {categories.length > 1 && (
        <section className="pb-8 bg-brand-secondary">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 tracking-[0.15em] uppercase transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-brand-main text-brand-secondary"
                      : "bg-brand-warm text-brand-main/60 hover:text-brand-main hover:bg-brand-cream-dark"
                  }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-12 lg:py-16 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid aspect-[3/4] bg-brand-main/5 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="break-inside-avoid"
                  >
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="group block relative overflow-hidden"
                    >
                      <div
                        className={
                          item.aspect === "portrait"
                            ? "aspect-[3/4]"
                            : "aspect-[4/3]"
                        }
                      >
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-brand-main/0 group-hover:bg-brand-main/40 transition-all duration-500 flex items-end">
                          <div className="p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <p
                              className="tracking-[0.2em] uppercase text-brand-tertiary-light mb-1"
                              style={{ fontSize: "0.6rem" }}
                            >
                              {item.category} &middot; {item.location}
                            </p>
                            <h3
                              className="font-serif text-brand-secondary"
                              style={{ fontSize: "1.3rem" }}
                            >
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24">
              <Camera className="w-12 h-12 text-brand-main/15 mx-auto mb-4" />
              <p className="font-serif text-brand-main/50 mb-2" style={{ fontSize: "1.3rem" }}>Portfolio Coming Soon</p>
              <p className="text-brand-main/30" style={{ fontSize: "0.9rem" }}>Beautiful collections are being curated. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-main text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Your Story Is Next
          </p>
          <h2
            className="font-serif text-brand-secondary mb-6"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Let's Create Something Beautiful
          </h2>
          <p
            className="text-brand-secondary/70 mb-10"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            Ready to see your love story captured with this same artistry and
            care? I'd love to hear from you.
          </p>
          <Link
            href="/inquire"
            className="inline-block px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
            style={{ fontSize: "0.7rem" }}
          >
            Inquire Now
          </Link>
        </div>
      </section>

      {showInitialLoader && (
        <BrandWaveLoader subtitle="Loading portfolio highlights..." />
      )}
    </div>
  );
}
