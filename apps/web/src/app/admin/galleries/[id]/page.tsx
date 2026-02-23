"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Upload, Eye, EyeOff, Image, X, Loader2 } from "lucide-react";
import { useGallery, usePublishGallery, useAddGalleryPhotos, useDeleteGalleryPhoto, useUpdateGallery } from "@/services/galleries";
import { uploadGalleryPhoto } from "@/services/upload";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { resolveMediaUrl } from "@/lib/media";

interface GalleryPhotoItem {
  id: string;
  filename?: string;
  caption?: string;
  url?: string;
  r2Key?: string;
}

interface GalleryDetails {
  id: string;
  title: string;
  status: string;
  clientName?: string;
  client?: { fullName?: string };
  photos?: GalleryPhotoItem[];
}

export default function AdminGalleryDetail() {
  const { id } = useParams();
  const { data: galleryData, isLoading } = useGallery(id as string);
  const publishGallery = usePublishGallery();
  const addPhotos = useAddGalleryPhotos();
  const deletePhoto = useDeleteGalleryPhoto();
  const updateGallery = useUpdateGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  if (isLoading) {
    return (
      <div>
        <div className="h-4 w-32 bg-brand-main/10 animate-pulse mb-6" />
        <div className="h-8 w-64 bg-brand-main/10 animate-pulse mb-2" />
        <div className="h-4 w-48 bg-brand-main/5 animate-pulse mb-6" />
        <div className="h-40 bg-brand-main/5 animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] bg-brand-main/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!galleryData) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Gallery Not Found</h1>
        <Link href="/admin/galleries" className="text-brand-tertiary" style={{ fontSize: "0.85rem" }}>Back to Galleries</Link>
      </div>
    );
  }

  const gallery = galleryData as GalleryDetails;
  const published = gallery.status === "published";
  const clientName = gallery.clientName || gallery.client?.fullName || "Unknown";
  const photos = gallery.photos || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const photoRecords: Array<{
        filename: string;
        r2Key: string;
        mimeType: string;
        fileSizeBytes: number;
      }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const { key } = await uploadGalleryPhoto(id as string, file);
        photoRecords.push({
          filename: file.name,
          r2Key: key,
          mimeType: file.type,
          fileSizeBytes: file.size,
        });
      }

      await addPhotos.mutateAsync({ id: id as string, photos: photoRecords });
    } catch (error) {
      console.error("Failed to upload photos:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0 || !fileInputRef.current) return;

    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
    fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const handlePublishToggle = () => {
    if (!published) {
      publishGallery.mutate(id as string);
    } else {
      updateGallery.mutate({ id: id as string, status: "draft" });
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!window.confirm("Delete this photo from the gallery?")) {
      return;
    }
    deletePhoto.mutate({ galleryId: id as string, photoId });
  };

  return (
    <div>
      <Link href="/admin/galleries" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Galleries
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-brand-main" style={{ fontSize: "1.8rem" }}>{gallery.title}</h1>
              {published ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700" style={{ fontSize: "0.6rem" }}><Eye className="w-3 h-3" /> Published</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700" style={{ fontSize: "0.6rem" }}><EyeOff className="w-3 h-3" /> Draft</span>
              )}
            </div>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>{clientName} · {photos.length} photos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublishToggle}
              disabled={publishGallery.isPending || updateGallery.isPending}
              className={`inline-flex items-center gap-2 px-5 py-2.5 tracking-[0.1em] uppercase transition-colors disabled:opacity-50 ${
                published ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-brand-main text-brand-secondary hover:bg-brand-main-light"
              }`} style={{ fontSize: "0.65rem" }}>
              {publishGallery.isPending || updateGallery.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : published ? (
                <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
              ) : (
                <><Eye className="w-3.5 h-3.5" /> Publish</>
              )}
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-white border-2 border-dashed border-brand-main/15 p-8 text-center mb-6 hover:border-brand-tertiary/40 transition-colors cursor-pointer"
        >
          {isUploading ? (
            <div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-brand-tertiary animate-spin" />
                <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>
                  Uploading photo {uploadProgress.current} of {uploadProgress.total}...
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-brand-main/5 h-1.5">
                <div
                  className="bg-brand-tertiary h-1.5 transition-all"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-brand-main/20 mx-auto mb-3" />
              <p className="text-brand-main/50 mb-1" style={{ fontSize: "0.85rem" }}>Click to upload photos</p>
              <p className="text-brand-main/30" style={{ fontSize: "0.75rem" }}>Drag & drop or click to browse · JPG, PNG up to 20MB each</p>
            </>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="relative group aspect-[4/3] overflow-hidden bg-brand-main/5"
              >
                <ImageWithFallback
                  src={resolveMediaUrl(photo.url || photo.r2Key || "")}
                  alt={photo.caption || photo.filename || `Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletePhoto.isPending}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: "0.65rem" }}>
                  {photo.filename || `Photo ${i + 1}`}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-brand-main/8">
            <Image className="w-10 h-10 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No photos uploaded yet.</p>
            <p className="text-brand-main/25" style={{ fontSize: "0.8rem" }}>Click the upload area above to add photos.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
