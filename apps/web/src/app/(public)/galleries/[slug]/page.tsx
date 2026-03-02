"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
  Copy,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { createBrowserClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { usePublicGalleryBySlug } from "@/services/galleries";
import { GalleryAuthModal } from "@/components/auth/gallery-auth-modal";
import { resolveMediaUrl } from "@/lib/media";

interface ApiPhoto {
  id: string;
  filename: string;
  url?: string | null;
  isFavorite?: boolean;
}

interface ApiGallery {
  id: string;
  title: string;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
  photoCount?: number;
  photos?: ApiPhoto[];
  accessEmailHint?: string | null;
}

type PendingAction = "share" | "download" | null;

const DOWNLOAD_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function hasFileExtension(filename: string): boolean {
  return /\.[a-z0-9]{2,8}$/i.test(filename.trim());
}

function getExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-z0-9]{2,8})$/i);
    return match?.[1]?.toLowerCase() || null;
  } catch {
    return null;
  }
}

function resolveDownloadFilename(
  filename: string,
  url: string,
  response: Response,
): string {
  const trimmed = filename.trim() || "photo";
  if (hasFileExtension(trimmed)) return trimmed;

  const contentType = response.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  const extFromMime = contentType ? DOWNLOAD_EXTENSION_BY_MIME[contentType] : null;
  const extFromUrl = getExtensionFromUrl(url);
  const ext = extFromMime || extFromUrl;
  return ext ? `${trimmed}.${ext}` : trimmed;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}

function mapGalleryStatus(status: string): "ready" | "editing" {
  if (status === "published") return "ready";
  return "editing";
}

export default function PublicHiddenGalleryPage() {
  const { slug } = useParams();
  const gallerySlug = slug as string;
  const { supabaseUser } = useAuthStore();
  const { data: apiGallery, isLoading } = usePublicGalleryBySlug(gallerySlug);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingPhoto, setDownloadingPhoto] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [canUseActions, setCanUseActions] = useState(false);
  const [accessError, setAccessError] = useState("");

  const gallery = useMemo(() => {
    if (!apiGallery || !(apiGallery as ApiGallery).id) {
      return null;
    }

    const galleryData = apiGallery as ApiGallery;
    const status = mapGalleryStatus(galleryData.status);
    const photos = (galleryData.photos || []).map((photo: ApiPhoto) => ({
      id: photo.id,
      url: resolveMediaUrl(photo.url || ""),
      favorite: photo.isFavorite || false,
      filename: photo.filename,
    }));

    return {
      title: galleryData.title,
      date: galleryData.publishedAt
        ? format(new Date(galleryData.publishedAt), "MMMM d, yyyy")
        : format(new Date(galleryData.createdAt), "MMMM d, yyyy"),
      status,
      accessEmailHint: galleryData.accessEmailHint || null,
      photos,
    };
  }, [apiGallery]);

  useEffect(() => {
    if (!gallery) return;
    setFavorites(
      new Set(gallery.photos.filter((photo) => photo.favorite).map((photo) => photo.id)),
    );
  }, [gallery]);

  const checkActionAccess = useCallback(async (): Promise<boolean> => {
    if (!gallerySlug) return false;
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setCanUseActions(false);
      return false;
    }

    const response = await fetch(`${API_URL}/galleries/public/${gallerySlug}/access`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      setCanUseActions(false);
      return false;
    }

    const payload = (await response.json()) as { allowed?: boolean };
    const allowed = Boolean(payload.allowed);
    setCanUseActions(allowed);
    return allowed;
  }, [gallerySlug]);

  useEffect(() => {
    if (!supabaseUser) {
      setCanUseActions(false);
      return;
    }

    checkActionAccess().catch(() => {
      setCanUseActions(false);
    });
  }, [supabaseUser, checkActionAccess]);

  const toggleFavorite = (photoId: string) => {
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const runShare = () => {
    const shareUrl = `${window.location.origin}/galleries/${gallerySlug}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      })
      .catch(() => {
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
      if (!photo.url) {
        throw new Error("Missing photo URL");
      }
      const response = await fetch(photo.url);
      if (!response.ok) {
        throw new Error("Failed to fetch photo");
      }
      const blob = await response.blob();
      const downloadName = resolveDownloadFilename(photo.filename, photo.url, response);
      triggerBrowserDownload(blob, downloadName);
    } catch {
      if (photo.url) {
        window.open(photo.url, "_blank", "noopener,noreferrer");
      }
    }
    setTimeout(() => setDownloadingPhoto(null), 500);
  };

  const runDownloadAll = async () => {
    if (!gallery) return;
    setDownloadingAll(true);
    setDownloadProgress(0);

    const total = gallery.photos.length;
    for (let index = 0; index < total; index += 1) {
      const photo = gallery.photos[index];
      try {
        if (!photo.url) {
          throw new Error("Missing photo URL");
        }
        const response = await fetch(photo.url);
        if (!response.ok) {
          throw new Error("Failed to fetch photo");
        }
        const blob = await response.blob();
        const downloadName = resolveDownloadFilename(photo.filename, photo.url, response);
        triggerBrowserDownload(blob, downloadName);
      } catch {
        // Skip failed downloads and continue the batch.
      }
      setDownloadProgress(Math.round(((index + 1) / total) * 100));
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setTimeout(() => {
      setDownloadingAll(false);
      setDownloadProgress(0);
    }, 900);
  };

  const handleRestrictedAction = async (action: Exclude<PendingAction, null>) => {
    setAccessError("");

    if (!supabaseUser) {
      setPendingAction(action);
      setAuthModalOpen(true);
      return;
    }

    const allowed = canUseActions || (await checkActionAccess());
    if (!allowed) {
      setAccessError(
        "This account does not have access for sharing or full downloads on this gallery.",
      );
      return;
    }

    if (action === "share") runShare();
    if (action === "download") void runDownloadAll();
  };

  const handleAuthenticated = async () => {
    const allowed = await checkActionAccess();

    if (!allowed) {
      setAccessError(
        "Signed in, but this account is not tied to this gallery. Use the invited email to unlock access.",
      );
      setPendingAction(null);
      return;
    }

    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;

    if (action === "share") runShare();
    if (action === "download") void runDownloadAll();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-brand-secondary">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center py-24">
          <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.6rem" }}>
            Gallery Not Found
          </h1>
          <Link
            href="/portfolio"
            className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
            style={{ fontSize: "0.9rem" }}
          >
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const filteredPhotos =
    filter === "favorites"
      ? gallery.photos.filter((photo) => favorites.has(photo.id))
      : gallery.photos;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-brand-secondary">
      <GalleryAuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onAuthenticated={handleAuthenticated}
        emailHint={gallery.accessEmailHint}
      />

      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-brand-main text-brand-secondary px-5 py-3 flex items-center gap-2 shadow-lg"
            style={{ fontSize: "0.85rem" }}
          >
            <Check className="w-4 h-4 text-brand-tertiary" />
            Gallery link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {downloadingAll && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-brand-main/15 px-6 py-4 shadow-lg w-80"
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-4"
            style={{ fontSize: "0.8rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>
                {gallery.title}
              </h1>
              <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>
                {gallery.date} &middot; {gallery.photos.length} photos
              </p>
            </div>

            {gallery.status === "ready" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleRestrictedAction("share")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-main/15 text-brand-main hover:bg-brand-main hover:text-brand-secondary transition-all duration-300 tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  {!supabaseUser || !canUseActions ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : shareToast ? (
                    <Copy className="w-3.5 h-3.5" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  {shareToast ? "Copied!" : "Share"}
                </button>
                <button
                  onClick={() => void handleRestrictedAction("download")}
                  disabled={downloadingAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 tracking-[0.1em] uppercase disabled:opacity-50"
                  style={{ fontSize: "0.65rem" }}
                >
                  {!supabaseUser || !canUseActions ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : downloadingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloadingAll ? `${downloadProgress}%` : "Download All"}
                </button>
              </div>
            )}
          </div>

          {accessError && (
            <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-red-700" style={{ fontSize: "0.8rem" }}>
                {accessError}
              </p>
            </div>
          )}
        </div>

        {gallery.status === "editing" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-brand-main/8 p-12 text-center"
          >
            <Clock className="w-10 h-10 text-brand-tertiary mx-auto mb-5" />
            <h2 className="font-serif text-brand-main mb-3" style={{ fontSize: "1.4rem" }}>
              Gallery Preparation in Progress
            </h2>
            <p className="text-brand-main/50 max-w-md mx-auto" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
              This gallery isn&apos;t published yet. Check back later.
            </p>
          </motion.div>
        ) : (
          <>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group cursor-pointer aspect-[4/3] overflow-hidden"
                  onClick={() => setLightboxIndex(gallery.photos.indexOf(photo))}
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-main/0 group-hover:bg-brand-main/20 transition-colors duration-300" />
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
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
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDownloadPhoto(photo);
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
      </div>

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
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex((previous) =>
                  previous !== null && previous > 0
                    ? previous - 1
                    : gallery.photos.length - 1,
                );
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 p-2"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex((previous) =>
                  previous !== null && previous < gallery.photos.length - 1
                    ? previous + 1
                    : 0,
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
              onClick={(event) => event.stopPropagation()}
            >
              <ImageWithFallback
                src={gallery.photos[lightboxIndex].url}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-white/40" style={{ fontSize: "0.8rem" }}>
                  {lightboxIndex + 1} of {gallery.photos.length}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFavorite(gallery.photos[lightboxIndex].id)}
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
                    onClick={() => void handleDownloadPhoto(gallery.photos[lightboxIndex])}
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
