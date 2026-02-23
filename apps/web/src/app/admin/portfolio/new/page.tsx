"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Save, Upload, X, Loader2, ImageIcon } from "lucide-react";
import {
  useCreatePortfolioItem,
  useAddPortfolioPhotos,
  useAdminPortfolio,
  useUpdatePortfolioItem,
} from "@/services/portfolio";
import { uploadPortfolioPhoto } from "@/services/upload";
import { EventTypeItem, useEventTypes } from "@/services/event-types";

interface PortfolioItemOption {
  id: string;
  title: string;
  category: string;
  description?: string;
  isFeatured?: boolean;
  featured?: boolean;
}

export default function AdminPortfolioNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const createPortfolioItem = useCreatePortfolioItem();
  const updatePortfolioItem = useUpdatePortfolioItem();
  const addPhotos = useAddPortfolioPhotos();
  const { data: portfolioItems = [] } = useAdminPortfolio();
  const { data: eventTypes = [] } = useEventTypes();
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const existingItem = (portfolioItems as PortfolioItemOption[]).find(
    (item) => item.id === editId,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    featured: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId || !existingItem) return;
    setForm({
      title: existingItem.title || "",
      category: existingItem.category || "",
      description: existingItem.description || "",
      featured: existingItem.featured ?? existingItem.isFeatured ?? false,
    });
  }, [editId, existingItem]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category) return;

    setIsUploading(true);
    setError("");
    try {
      let itemId = editId || "";
      if (editId) {
        await updatePortfolioItem.mutateAsync({
          id: editId,
          title: form.title,
          category: form.category,
          description: form.description || undefined,
          isFeatured: form.featured,
        });
      } else {
        const item = await createPortfolioItem.mutateAsync({
          title: form.title,
          category: form.category,
          description: form.description || undefined,
          isFeatured: form.featured,
        });
        itemId = item.id;
      }

      // Step 2: Upload photos to R2 if any selected
      if (selectedFiles.length > 0) {
        setUploadProgress({ current: 0, total: selectedFiles.length });
        const photoRecords: Array<{ r2Key: string; mimeType: string }> = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress({ current: i + 1, total: selectedFiles.length });

          // Upload via server-side API (avoids R2 CORS issues)
          const { key } = await uploadPortfolioPhoto(itemId, file);
          photoRecords.push({ r2Key: key, mimeType: file.type });
        }

        // Step 3: Save photo records
        await addPhotos.mutateAsync({ id: itemId, photos: photoRecords });
      }

      router.push("/admin/portfolio");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        `Failed to ${editId ? "update" : "create"} portfolio item. Please try again.`;
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsUploading(false);
    }
  };

  const isPending =
    createPortfolioItem.isPending ||
    updatePortfolioItem.isPending ||
    addPhotos.isPending ||
    isUploading;

  return (
    <div>
      <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Portfolio
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>
          {editId ? "Edit Portfolio Collection" : "Add Portfolio Collection"}
        </h1>
        <p className="text-brand-main/50 mb-8" style={{ fontSize: "0.9rem" }}>
          {editId
            ? "Update details for an existing portfolio collection."
            : "Create a new portfolio collection for your public website."}
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white border border-brand-main/8 p-6 space-y-5">
            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Collection Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Golden Hour at Baker Beach"
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.9rem" }}
                required />
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Event Type *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.9rem" }}
                required>
                <option value="">Select event type...</option>
                {eventTypeOptions.map((et) => <option key={et.slug} value={et.slug}>{et.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this collection..."
                rows={3}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none" style={{ fontSize: "0.85rem" }} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-brand-tertiary" />
              <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>Feature this collection on the homepage</span>
            </label>
          </div>

          {/* Upload area */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="bg-white border-2 border-dashed border-brand-main/15 p-10 text-center hover:border-brand-tertiary/40 transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-brand-main/20 mx-auto mb-3" />
            <p className="text-brand-main/50 mb-1" style={{ fontSize: "0.9rem" }}>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} photo${selectedFiles.length === 1 ? "" : "s"} selected — click to add more`
                : "Upload Collection Photos"}
            </p>
            <p className="text-brand-main/30" style={{ fontSize: "0.75rem" }}>Drag & drop or click to browse · JPG, PNG up to 20MB each</p>
          </div>

          {/* Preview thumbnails */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square bg-brand-secondary border border-brand-main/8 overflow-hidden">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress */}
          {isUploading && uploadProgress.total > 0 && (
            <div className="bg-white border border-brand-main/8 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-4 h-4 text-brand-tertiary animate-spin" />
                <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>
                  Uploading photo {uploadProgress.current} of {uploadProgress.total}...
                </span>
              </div>
              <div className="w-full bg-brand-main/5 h-1.5">
                <div
                  className="bg-brand-tertiary h-1.5 transition-all"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700" style={{ fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50" style={{ fontSize: "0.65rem" }}>
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {isUploading ? "Uploading..." : "Saving..."}</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> {editId ? "Save Changes" : "Save Collection"}</>
              )}
            </button>
            <Link href="/admin/portfolio" className="text-brand-main/40 hover:text-brand-main transition-colors" style={{ fontSize: "0.8rem" }}>Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
