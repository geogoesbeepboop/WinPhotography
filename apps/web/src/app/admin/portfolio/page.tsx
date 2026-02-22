"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PlusCircle, Eye, EyeOff, Star, Image, Trash2 } from "lucide-react";
import { mockPortfolio } from "@/lib/mock-data/admin-data";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

export default function AdminPortfolio() {
  const [items, setItems] = useState(mockPortfolio);

  const togglePublish = (id: string) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, published: !p.published } : p));
  };

  const toggleFeatured = (id: string) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, featured: !p.featured } : p));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const categories = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? items : items.filter((p) => p.category === activeCategory);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Portfolio</h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Manage your public portfolio collections.</p>
        </div>
        <Link href="/admin/portfolio/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
          <PlusCircle className="w-3.5 h-3.5" /> Add Collection
        </Link>
      </motion.div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 transition-colors capitalize ${activeCategory === cat ? "bg-brand-main text-brand-secondary" : "bg-white border border-brand-main/10 text-brand-main/50 hover:text-brand-main"}`}
            style={{ fontSize: "0.7rem" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-brand-main/8 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {item.featured && (
                  <span className="px-2 py-0.5 bg-brand-tertiary text-white" style={{ fontSize: "0.55rem" }}>Featured</span>
                )}
                {item.published ? (
                  <span className="px-2 py-0.5 bg-green-500 text-white" style={{ fontSize: "0.55rem" }}>Live</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-500 text-white" style={{ fontSize: "0.55rem" }}>Draft</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-brand-main mb-0.5" style={{ fontSize: "1rem" }}>{item.title}</h3>
              <p className="text-brand-main/40 mb-3" style={{ fontSize: "0.75rem" }}>{item.category} · {item.imageCount} images</p>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(item.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors ${item.published ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                  style={{ fontSize: "0.65rem" }}>
                  {item.published ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                </button>
                <button onClick={() => toggleFeatured(item.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors ${item.featured ? "text-brand-tertiary" : "text-brand-main/30 hover:text-brand-tertiary"}`}
                  style={{ fontSize: "0.65rem" }}>
                  <Star className={`w-3 h-3 ${item.featured ? "fill-current" : ""}`} /> {item.featured ? "Featured" : "Feature"}
                </button>
                <button onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-400 hover:text-red-600 transition-colors ml-auto"
                  style={{ fontSize: "0.65rem" }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Image className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No portfolio items in this category.</p>
        </div>
      )}
    </div>
  );
}
