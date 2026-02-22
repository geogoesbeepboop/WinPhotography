"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Download,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useGallery } from "@/services/galleries";

interface ApiPhoto {
  id: string;
  filename: string;
  r2Key?: string;
  r2ThumbnailKey?: string;
  isFavorite?: boolean;
  url?: string;
}

interface ApiGallery {
  id: string;
  title: string;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
  photoCount?: number;
  photos?: ApiPhoto[];
  estimatedDelivery?: string;
}

const mockGalleries: Record<
  string,
  {
    title: string;
    date: string;
    status: "ready" | "editing";
    estimatedDelivery?: string;
    photos: { id: string; url: string; favorite: boolean; filename: string }[];
  }
> = {
  g1: {
    title: "Engagement Session",
    date: "January 15, 2026",
    status: "ready",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwcmluZyUyMHByb3Bvc2FsJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNjk5MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: true,
        filename: "engagement-001.jpg",
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1667565454350-fd0484baaa2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBjb3VwbGUlMjBzaWxob3VldHRlJTIwb3V0ZG9vciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODY3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: false,
        filename: "engagement-002.jpg",
      },
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1637537791710-a78698013174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwbmF0dXJlJTIwdHJhaWwlMjBmb3Jlc3R8ZW58MXx8fHwxNzcxNzM4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: false,
        filename: "engagement-003.jpg",
      },
      {
        id: "p4",
        url: "https://images.unsplash.com/photo-1768039376092-70e587cb7b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdldHRpbmclMjByZWFkeSUyMHByZXBhcmF0aW9uJTIwY2FuZGlkfGVufDF8fHx8MTc3MTczODY3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: true,
        filename: "engagement-004.jpg",
      },
      {
        id: "p5",
        url: "https://images.unsplash.com/photo-1677768061409-3d4fbd0250d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvciUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNzM4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: false,
        filename: "engagement-005.jpg",
      },
      {
        id: "p6",
        url: "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZ29sZGVuJTIwaG91ciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODYzNnww&ixlib=rb-4.1.0&q=80&w=1080",
        favorite: false,
        filename: "engagement-006.jpg",
      },
    ],
  },
  g2: {
    title: "Wedding Day",
    date: "March 22, 2026",
    status: "editing",
    estimatedDelivery: "April 20, 2026",
    photos: [],
  },
};

function mapGalleryStatus(status: string): "ready" | "editing" {
  if (status === "published") return "ready";
  return "editing";
}

export default function PortalGallery() {
  const { galleryId } = useParams();
  const id = galleryId as string;

  // Try fetching from API
  const { data: apiGallery, isLoading, isError } = useGallery(id);

  // Determine the gallery data: API first, then mock fallback
  const gallery = useMemo(() => {
    if (apiGallery && (apiGallery as ApiGallery).id) {
      const g = apiGallery as ApiGallery;
      const status = mapGalleryStatus(g.status);
      const photos = (g.photos || []).map((p: ApiPhoto) => ({
        id: p.id,
        url: p.url || p.r2Key || "",
        favorite: p.isFavorite || false,
        filename: p.filename,
      }));

      // If published but no photos available yet (R2 not set up), show editing state
      const effectiveStatus = status === "ready" && photos.length === 0 ? "editing" : status;

      return {
        title: g.title,
        date: g.publishedAt
          ? format(new Date(g.publishedAt), "MMMM d, yyyy")
          : format(new Date(g.createdAt), "MMMM d, yyyy"),
        status: effectiveStatus,
        estimatedDelivery: g.estimatedDelivery,
        photos,
      };
    }

    // Fall back to mock data
    if (!isLoading) {
      return mockGalleries[id || ""] || null;
    }
    return null;
  }, [apiGallery, isLoading, id]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(gallery?.photos.filter((p) => p.favorite).map((p) => p.id) || [])
  );
  const [shareToast, setShareToast] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingPhoto, setDownloadingPhoto] = useState<string | null>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>
          Gallery Not Found
        </h1>
        <Link
          href="/portal"
          className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
          style={{ fontSize: "0.85rem" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredPhotos =
    filter === "favorites"
      ? gallery.photos.filter((p) => favorites.has(p.id))
      : gallery.photos;

  const toggleFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/portal/galleries/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }).catch(() => {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  };

  const handleDownloadPhoto = async (photo: { url: string; filename: string; id: string }) => {
    setDownloadingPhoto(photo.id);
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(photo.url, "_blank");
    }
    setTimeout(() => setDownloadingPhoto(null), 500);
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    setDownloadProgress(0);
    const total = gallery.photos.length;
    for (let i = 0; i < total; i++) {
      const photo = gallery.photos[i];
      try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // skip failed downloads
      }
      setDownloadProgress(Math.round(((i + 1) / total) * 100));
      await new Promise((r) => setTimeout(r, 400));
    }
    setTimeout(() => {
      setDownloadingAll(false);
      setDownloadProgress(0);
    }, 1000);
  };

  return (
    <div>
      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-main text-brand-secondary px-5 py-3 flex items-center gap-2 shadow-lg"
            style={{ fontSize: "0.85rem" }}
          >
            <Check className="w-4 h-4 text-brand-tertiary" />
            Gallery link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download All Progress */}
      <AnimatePresence>
        {downloadingAll && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-brand-main/15 px-6 py-4 shadow-lg w-80"
          >
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-tertiary" />
              <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>
                Downloading photos...
              </span>
            </div>
            <div className="w-full h-1.5 bg-brand-main/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-tertiary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-brand-main/40 mt-1.5" style={{ fontSize: "0.7rem" }}>
              {downloadProgress}% complete
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-4"
          style={{ fontSize: "0.8rem" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              className="font-serif text-brand-main mb-1"
              style={{ fontSize: "1.8rem" }}
            >
              {gallery.title}
            </h1>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>
              {gallery.date} &middot; {gallery.photos.length} photos
            </p>
          </div>
          {gallery.status === "ready" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-main/15 text-brand-main hover:bg-brand-main hover:text-brand-secondary transition-all duration-300 tracking-[0.1em] uppercase"
                style={{ fontSize: "0.65rem" }}
              >
                {shareToast ? <Copy className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {shareToast ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 tracking-[0.1em] uppercase disabled:opacity-50"
                style={{ fontSize: "0.65rem" }}
              >
                {downloadingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingAll ? `${downloadProgress}%` : "Download All"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Content */}
      {gallery.status === "editing" ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-brand-main/8 p-12 text-center"
        >
          <Clock className="w-10 h-10 text-brand-tertiary mx-auto mb-5" />
          <h2
            className="font-serif text-brand-main mb-3"
            style={{ fontSize: "1.4rem" }}
          >
            Your Gallery is Being Prepared
          </h2>
          <p
            className="text-brand-main/50 max-w-md mx-auto mb-6"
            style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
          >
            I&apos;m carefully editing and curating your photos. You&apos;ll receive an
            email notification as soon as your gallery is ready to view.
          </p>
          {gallery.estimatedDelivery && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-warm text-brand-main/60" style={{ fontSize: "0.8rem" }}>
              <Clock className="w-4 h-4 text-brand-tertiary" />
              Estimated delivery: {gallery.estimatedDelivery}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`tracking-[0.1em] uppercase transition-colors ${
                filter === "all"
                  ? "text-brand-main"
                  : "text-brand-main/30 hover:text-brand-main/60"
              }`}
              style={{ fontSize: "0.7rem" }}
            >
              All Photos ({gallery.photos.length})
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={`tracking-[0.1em] uppercase transition-colors inline-flex items-center gap-1.5 ${
                filter === "favorites"
                  ? "text-brand-tertiary"
                  : "text-brand-main/30 hover:text-brand-main/60"
              }`}
              style={{ fontSize: "0.7rem" }}
            >
              <Heart className="w-3 h-3" />
              Favorites ({favorites.size})
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative group cursor-pointer aspect-[4/3] overflow-hidden"
                onClick={() =>
                  setLightboxIndex(gallery.photos.indexOf(photo))
                }
              >
                <ImageWithFallback
                  src={photo.url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-main/0 group-hover:bg-brand-main/20 transition-colors duration-300" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(photo.id);
                  }}
                  className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      favorites.has(photo.id)
                        ? "fill-brand-tertiary text-brand-tertiary"
                        : "text-white"
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPhoto(photo);
                  }}
                  className="absolute bottom-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {downloadingPhoto === photo.id ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-white" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {filteredPhotos.length === 0 && filter === "favorites" && (
            <div className="text-center py-16">
              <Heart className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
              <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
                No favorites yet. Click the heart icon on photos to add them.
              </p>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0
                    ? prev - 1
                    : gallery.photos.length - 1
                );
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev < gallery.photos.length - 1
                    ? prev + 1
                    : 0
                );
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={gallery.photos[lightboxIndex].url}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="flex items-center justify-between mt-4 px-2">
                <span
                  className="text-white/40"
                  style={{ fontSize: "0.8rem" }}
                >
                  {lightboxIndex + 1} of {gallery.photos.length}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleFavorite(gallery.photos[lightboxIndex].id)
                    }
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.has(gallery.photos[lightboxIndex].id)
                          ? "fill-brand-tertiary text-brand-tertiary"
                          : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDownloadPhoto(gallery.photos[lightboxIndex])}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {downloadingPhoto === gallery.photos[lightboxIndex].id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
