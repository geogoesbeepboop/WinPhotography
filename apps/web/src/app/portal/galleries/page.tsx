"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useMyGalleries } from "@/services/portal";

interface ApiGalleryPhoto {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  r2Key?: string;
}

interface ApiGallery {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
  photoCount: number;
  createdAt: string;
  coverImage?: string;
  photos?: ApiGalleryPhoto[];
}

type GalleryTab = "all" | "ready" | "editing";

function mapGalleryStatus(status: string): "ready" | "editing" {
  return status === "published" ? "ready" : "editing";
}

const statusConfig = {
  ready: {
    label: "Ready to View",
    color: "bg-green-600 text-white",
    icon: CheckCircle2,
  },
  editing: {
    label: "In Editing",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
};

export default function PortalGalleriesPage() {
  const { data: galleriesData, isLoading } = useMyGalleries();
  const [activeTab, setActiveTab] = useState<GalleryTab>("all");
  const [search, setSearch] = useState("");

  const galleries = useMemo(() => {
    const source = (galleriesData ?? []) as ApiGallery[];
    return source.map((gallery) => {
      const status = mapGalleryStatus(gallery.status);
      const firstPhoto = gallery.photos?.[0];
      const coverImage =
        gallery.coverImage ||
        firstPhoto?.thumbnailUrl ||
        firstPhoto?.url ||
        firstPhoto?.r2Key ||
        "";

      return {
        ...gallery,
        status,
        coverImage,
        displayDate: gallery.publishedAt
          ? format(new Date(gallery.publishedAt), "MMMM d, yyyy")
          : format(new Date(gallery.createdAt), "MMMM d, yyyy"),
      };
    });
  }, [galleriesData]);

  const counts = {
    all: galleries.length,
    ready: galleries.filter((gallery) => gallery.status === "ready").length,
    editing: galleries.filter((gallery) => gallery.status === "editing").length,
  };

  const filteredGalleries = galleries.filter((gallery) => {
    if (activeTab !== "all" && gallery.status !== activeTab) return false;
    if (!search.trim()) return true;
    return gallery.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>
          Your Galleries
        </h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
          View your delivered galleries and track sessions that are still being edited.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "All Galleries", key: "all" as const, color: "text-brand-main" },
          { label: "Ready", key: "ready" as const, color: "text-green-600" },
          { label: "In Editing", key: "editing" as const, color: "text-amber-600" },
        ].map((item) => (
          <div key={item.key} className="bg-card border border-brand-main/8 p-5">
            <p className="font-serif text-brand-main" style={{ fontSize: "1.5rem" }}>
              {counts[item.key]}
            </p>
            <p className={`${item.color} tracking-[0.05em] uppercase`} style={{ fontSize: "0.65rem" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {([
          { value: "all", label: "All" },
          { value: "ready", label: "Ready" },
          { value: "editing", label: "In Editing" },
        ] as Array<{ value: GalleryTab; label: string }>).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === tab.value
                ? "bg-brand-main text-brand-secondary"
                : "bg-card border border-brand-main/10 text-brand-main/50 hover:text-brand-main"
            }`}
            style={{ fontSize: "0.7rem" }}
          >
            {tab.label} ({counts[tab.value]})
          </button>
        ))}
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search galleries..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
          style={{ fontSize: "0.85rem" }}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
        </div>
      ) : filteredGalleries.length === 0 ? (
        <div className="bg-card border border-brand-main/8 p-12 text-center">
          <ImageIcon className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
            No galleries found for this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGalleries.map((gallery, index) => {
            const config = statusConfig[gallery.status];
            return (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={`/portal/galleries/${gallery.id}`}
                  className="group block bg-card border border-brand-main/8 overflow-hidden hover:border-brand-tertiary/30 transition-colors"
                >
                  <div className="relative h-52 overflow-hidden">
                    <ImageWithFallback
                      src={gallery.coverImage}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.color}`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        <config.icon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.2rem" }}>
                      {gallery.title}
                    </h2>
                    <p className="text-brand-main/40" style={{ fontSize: "0.8rem" }}>
                      {gallery.displayDate} · {gallery.photoCount || 0} photos
                    </p>
                    <p
                      className="mt-3 text-brand-tertiary inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {gallery.status === "ready" ? "Open Gallery" : "View Gallery Status"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
