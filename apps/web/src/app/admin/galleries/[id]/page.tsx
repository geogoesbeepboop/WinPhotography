"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Upload, Eye, EyeOff, Trash2, Image, Send, CheckCircle2, X } from "lucide-react";
import { mockGalleries } from "@/lib/mock-data/admin-data";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

const mockPhotos = [
  "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?w=400",
  "https://images.unsplash.com/photo-1667565454350-fd0484baaa2c?w=400",
  "https://images.unsplash.com/photo-1637537791710-a78698013174?w=400",
  "https://images.unsplash.com/photo-1768039376092-70e587cb7b94?w=400",
  "https://images.unsplash.com/photo-1677768061409-3d4fbd0250d1?w=400",
  "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?w=400",
];

export default function AdminGalleryDetail() {
  const { id } = useParams();
  const gallery = mockGalleries.find((g) => g.id === id);
  const [isPublished, setIsPublished] = useState(gallery?.status === "published");
  const [photos, setPhotos] = useState(gallery?.status === "published" ? mockPhotos : []);
  const [uploading, setUploading] = useState(false);
  const [notified, setNotified] = useState(false);

  if (!gallery) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Gallery Not Found</h1>
        <Link href="/admin/galleries" className="text-brand-tertiary" style={{ fontSize: "0.85rem" }}>Back to Galleries</Link>
      </div>
    );
  }

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setPhotos((prev) => [...prev, mockPhotos[Math.floor(Math.random() * mockPhotos.length)]]);
      setUploading(false);
    }, 1500);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
              {isPublished ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700" style={{ fontSize: "0.6rem" }}><Eye className="w-3 h-3" /> Published</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700" style={{ fontSize: "0.6rem" }}><EyeOff className="w-3 h-3" /> Draft</span>
              )}
            </div>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>{gallery.clientName} · {photos.length} photos</p>
          </div>
          <div className="flex items-center gap-3">
            {isPublished && !notified && (
              <button onClick={() => setNotified(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors" style={{ fontSize: "0.7rem" }}>
                <Send className="w-3.5 h-3.5" /> Notify Client
              </button>
            )}
            {notified && (
              <span className="inline-flex items-center gap-1.5 text-green-600 px-3" style={{ fontSize: "0.75rem" }}><CheckCircle2 className="w-4 h-4" /> Client notified</span>
            )}
            <button onClick={() => setIsPublished(!isPublished)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 tracking-[0.1em] uppercase transition-colors ${
                isPublished ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-brand-main text-brand-secondary hover:bg-brand-main-light"
              }`} style={{ fontSize: "0.65rem" }}>
              {isPublished ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white border-2 border-dashed border-brand-main/15 p-8 text-center mb-6 hover:border-brand-tertiary/40 transition-colors cursor-pointer" onClick={handleSimulateUpload}>
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-tertiary border-t-transparent rounded-full animate-spin" />
              <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-brand-main/20 mx-auto mb-3" />
              <p className="text-brand-main/50 mb-1" style={{ fontSize: "0.85rem" }}>Click to upload photos</p>
              <p className="text-brand-main/30" style={{ fontSize: "0.75rem" }}>Drag & drop or click to browse (simulated)</p>
            </>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <motion.div
                key={`${url}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="relative group aspect-[4/3] overflow-hidden bg-brand-main/5"
              >
                <ImageWithFallback src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: "0.65rem" }}>
                  {i + 1}
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
