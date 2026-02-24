"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PlusCircle, Eye, EyeOff, Star, Image, Trash2, Edit2 } from "lucide-react";
import { useAdminPortfolio, useUpdatePortfolioItem, useDeletePortfolioItem } from "@/services/portfolio";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { resolveMediaUrl } from "@/lib/media";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PortfolioAdminItem {
  id: string;
  title: string;
  category: string;
  imageCount?: number;
  photos?: Array<{ id?: string; url?: string; r2Key?: string; thumbnailUrl?: string; r2ThumbnailKey?: string }>;
  published?: boolean;
  isPublished?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  coverImage?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
}

export default function AdminPortfolio() {
  const { data: portfolioData = [], isLoading } = useAdminPortfolio();
  const { data: eventTypes = [] } = useEventTypes();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();

  const [activeCategory, setActiveCategory] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const items = portfolioData as PortfolioAdminItem[];
  const eventTypeOptions = eventTypes as EventTypeItem[];

  const togglePublish = (item: PortfolioAdminItem) => {
    const isPublished = item.published ?? item.isPublished ?? false;
    updateItem.mutate({ id: item.id, isPublished: !isPublished, published: !isPublished });
  };

  const toggleFeatured = (item: PortfolioAdminItem) => {
    const isFeatured = item.featured ?? item.isFeatured ?? false;
    updateItem.mutate({ id: item.id, isFeatured: !isFeatured, featured: !isFeatured });
  };

  const removeItem = () => {
    if (!deleteTarget) return;
    deleteItem.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const categories = ["All", ...Array.from(new Set(items.map((p) => p.category)))];

  const filtered = activeCategory === "All" ? items : items.filter((p) => p.category === activeCategory);

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="h-8 w-36 bg-brand-main/10 animate-pulse mb-1" />
            <div className="h-4 w-64 bg-brand-main/5 animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-brand-main/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-brand-main/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-brand-main/8 overflow-hidden">
              <div className="h-48 bg-brand-main/5 animate-pulse" />
              <div className="p-4">
                <div className="h-5 w-36 bg-brand-main/10 animate-pulse mb-2" />
                <div className="h-3 w-24 bg-brand-main/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            {cat === "All" ? cat : getEventTypeLabel(cat, eventTypeOptions)}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => {
          const isPublished = item.published ?? item.isPublished ?? false;
          const isFeatured = item.featured ?? item.isFeatured ?? false;
          const firstPhoto = item.photos?.[0];
          const coverImage = resolveMediaUrl(
            item.coverImageUrl ||
              item.coverImageKey ||
              item.coverImage ||
              firstPhoto?.url ||
              firstPhoto?.r2Key ||
              firstPhoto?.thumbnailUrl ||
              firstPhoto?.r2ThumbnailKey ||
              "",
          );
          const imageCount = item.imageCount ?? item.photos?.length ?? 0;
          const categoryLabel = getEventTypeLabel(item.category, eventTypeOptions) || item.category;

          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-brand-main/8 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback src={coverImage} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {isFeatured && (
                    <span className="px-2 py-0.5 bg-brand-tertiary text-white" style={{ fontSize: "0.55rem" }}>Featured</span>
                  )}
                  {isPublished ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white" style={{ fontSize: "0.55rem" }}>Live</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-500 text-white" style={{ fontSize: "0.55rem" }}>Draft</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-brand-main mb-0.5" style={{ fontSize: "1rem" }}>{item.title}</h3>
                <p className="text-brand-main/40 mb-3" style={{ fontSize: "0.75rem" }}>{categoryLabel} · {imageCount} images</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublish(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors ${isPublished ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                    style={{ fontSize: "0.65rem" }}>
                    {isPublished ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                  </button>
                  <button onClick={() => toggleFeatured(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors ${isFeatured ? "text-brand-tertiary" : "text-brand-main/30 hover:text-brand-tertiary"}`}
                    style={{ fontSize: "0.65rem" }}>
                    <Star className={`w-3 h-3 ${isFeatured ? "fill-current" : ""}`} /> {isFeatured ? "Featured" : "Feature"}
                  </button>
                  <Link
                    href={`/admin/portfolio/new?edit=${item.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-brand-main/40 hover:text-brand-main transition-colors"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </Link>
                  <button onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-400 hover:text-red-600 transition-colors ml-auto"
                    style={{ fontSize: "0.65rem" }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Image className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No portfolio items in this category.</p>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeItem}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
