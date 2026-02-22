"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { usePortfolio } from "@/services/portfolio";

const defaultCategories = [
  "All",
  "Weddings",
  "Elopements",
  "Proposals",
  "Engagements",
  "Graduation",
  "Headshots",
  "Events",
];

const portfolioItems = [
  {
    slug: "sarah-james-elopement",
    title: "Sarah & James",
    category: "Elopements",
    location: "Mt. Hood, Oregon",
    image:
      "https://images.unsplash.com/photo-1764773965414-7a0aa9c2a656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwZm9yZXN0JTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNzIxNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "portrait" as const,
  },
  {
    slug: "emily-david-wedding",
    title: "Emily & David",
    category: "Weddings",
    location: "Bend, Oregon",
    image:
      "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "landscape" as const,
  },
  {
    slug: "marco-surprise-proposal",
    title: "Marco & Alicia",
    category: "Proposals",
    location: "Cannon Beach, Oregon",
    image:
      "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "portrait" as const,
  },
  {
    slug: "outdoor-ceremony",
    title: "Rachel & Thomas",
    category: "Weddings",
    location: "Columbia River Gorge",
    image:
      "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzE3MjE2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "landscape" as const,
  },
  {
    slug: "graduation-maya",
    title: "Maya's Graduation",
    category: "Graduation",
    location: "University of Oregon",
    image:
      "https://images.unsplash.com/photo-1641335339082-f59be37f758d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwcG9ydHJhaXQlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzE3MjE2MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "portrait" as const,
  },
  {
    slug: "headshot-professional",
    title: "Executive Portraits",
    category: "Headshots",
    location: "Studio, San Francisco",
    image:
      "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHN0dWRpbyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTY4ODA1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "portrait" as const,
  },
  {
    slug: "corporate-event",
    title: "Annual Gala",
    category: "Events",
    location: "San Francisco Art Museum",
    image:
      "https://images.unsplash.com/photo-1767070806009-152054f6edd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZXZlbnQlMjBjZWxlYnJhdGlvbiUyMHBhcnR5fGVufDF8fHx8MTc3MTcyMTYxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "landscape" as const,
  },
  {
    slug: "urban-engagement",
    title: "Nadia & Kevin",
    category: "Engagements",
    location: "Mission District, San Francisco",
    image:
      "https://images.unsplash.com/photo-1768772918151-2d0100b534b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwY291cGxlJTIwY2l0eSUyMHVyYmFufGVufDF8fHx8MTc3MTcyMTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "portrait" as const,
  },
  {
    slug: "reception-details",
    title: "Lauren & Chris",
    category: "Weddings",
    location: "Wine Country, Willamette",
    image:
      "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    aspect: "landscape" as const,
  },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: apiItems } = usePortfolio();

  const items = useMemo(() => {
    if (apiItems?.length > 0) {
      return apiItems.map((item: any) => ({
        slug: item.slug,
        title: item.title,
        category: item.category,
        location: item.description?.split(',').pop()?.trim() || 'Pacific Northwest',
        image: item.coverImageKey || item.photos?.[0]?.r2Key || '',
        aspect: 'portrait' as const,
      }));
    }
    return portfolioItems; // fallback to hardcoded
  }, [apiItems]);

  const categories = useMemo(() => {
    if (apiItems?.length > 0) {
      const uniqueCategories = [...new Set(apiItems.map((item: any) => item.category))].filter(Boolean) as string[];
      return ["All", ...uniqueCategories];
    }
    return defaultCategories;
  }, [apiItems]);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item: any) => item.category === activeCategory);

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

      {/* Gallery Grid */}
      <section className="py-12 lg:py-16 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item: any) => (
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
    </div>
  );
}
