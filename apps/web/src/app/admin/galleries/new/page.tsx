"use client";

import { useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useBookings } from "@/services/bookings";
import {
  useCreateGallery,
  useAddGalleryPhotos,
} from "@/services/galleries";
import { uploadGalleryPhoto } from "@/services/upload";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { imageUploadAcceptList, isSupportedImageUpload } from "@/lib/image-upload";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import {
  DEFAULT_BOOKING_TIMEZONE,
  formatBookingDateTime,
} from "@/lib/booking-date-time";
import {
  BookingLifecycleStage,
} from "@/lib/booking-lifecycle";

interface BookingOption {
  id: string;
  status: string;
  lifecycleStage?: BookingLifecycleStage;
  depositAmount?: number;
  packagePrice?: number;
  payments?: Array<{ amount?: number; status?: string }>;
  galleries?: Array<{ status?: string }>;
  clientName?: string;
  client?: { fullName?: string };
  eventType?: string;
  packageName?: string;
  date?: string;
  eventDate?: string;
  time?: string;
  eventTime?: string;
  eventTimezone?: string;
  location?: string;
  eventLocation?: string;
}

function AdminGalleryNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBooking = searchParams.get("booking") || "";

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: eventTypes = [] } = useEventTypes();
  const createGallery = useCreateGallery();
  const addGalleryPhotos = useAddGalleryPhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitGuardRef = useRef(false);

  const [form, setForm] = useState({
    bookingId: preselectedBooking,
    title: "",
    notes: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const bookingOptions = bookings as BookingOption[];
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const availableBookings = bookingOptions.filter((booking) => {
    return (
      booking.status === "pending_full_payment" ||
      booking.status === "pending_delivery"
    );
  });

  const selectedBooking = bookingOptions.find((booking) => booking.id === form.bookingId);

  const extractSupportedFiles = (files: File[]): File[] => {
    const supported = files.filter(isSupportedImageUpload);
    if (supported.length !== files.length) {
      setError(
        "Some files were skipped. Supported formats: JPG, PNG, WEBP, GIF, AVIF. HEIC/HEIF/TIFF/BMP are converted to JPG when supported.",
      );
    } else {
      setError("");
    }
    return supported;
  };

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFiles((previous) => [...previous, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((previous) => [...previous, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const supported = extractSupportedFiles(Array.from(event.target.files || []));
    addFiles(supported);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const supported = extractSupportedFiles(Array.from(event.dataTransfer.files || []));
    addFiles(supported);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
    setPreviews((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const isPending = createGallery.isPending || addGalleryPhotos.isPending || isUploading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitGuardRef.current) return;

    if (!form.bookingId || !form.title) {
      setError("Please select a booking and enter a title.");
      return;
    }

    submitGuardRef.current = true;
    setError("");

    try {
      const createdGallery = await createGallery.mutateAsync({
        bookingId: form.bookingId,
        title: form.title,
        description: form.notes || undefined,
      });

      const galleryId = createdGallery.id as string;

      if (selectedFiles.length > 0) {
        setIsUploading(true);
        setUploadProgress({ current: 0, total: selectedFiles.length });

        const photoRecords: Array<{
          filename: string;
          r2Key: string;
          mimeType: string;
          fileSizeBytes: number;
        }> = [];

        for (let index = 0; index < selectedFiles.length; index += 1) {
          const file = selectedFiles[index];
          setUploadProgress({ current: index + 1, total: selectedFiles.length });

          const { key } = await uploadGalleryPhoto(galleryId, file);
          photoRecords.push({
            filename: file.name,
            r2Key: key,
            mimeType: file.type,
            fileSizeBytes: file.size,
          });
        }

        await addGalleryPhotos.mutateAsync({ id: galleryId, photos: photoRecords });
      }

      router.push(`/admin/galleries/${galleryId}`);
    } catch (submitError: any) {
      const message =
        submitError?.response?.data?.message ||
        "Failed to create gallery. Please review your input and try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setIsUploading(false);
      submitGuardRef.current = false;
    }
  };

  if (bookingsLoading) {
    return (
      <div>
        <div className="h-4 w-32 bg-brand-main/10 animate-pulse mb-6" />
        <div className="h-8 w-48 bg-brand-main/10 animate-pulse mb-2" />
        <div className="h-4 w-72 bg-brand-main/5 animate-pulse mb-8" />
        <div className="max-w-2xl bg-white border border-brand-main/8 p-6 space-y-5">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-12 bg-brand-main/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/galleries"
        className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6"
        style={{ fontSize: "0.8rem" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Galleries
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>
          Create Gallery
        </h1>
        <p className="text-brand-main/50 mb-8" style={{ fontSize: "0.9rem" }}>
          Set up a new photo gallery for a client booking and upload photos in one flow.
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          <div className="bg-white border border-brand-main/8 p-6 space-y-5">
            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Booking *</label>
              <select
                value={form.bookingId}
                onChange={(event) => {
                  const booking = availableBookings.find((option) => option.id === event.target.value);
                  const clientName = booking ? (booking.clientName || booking.client?.fullName || "") : "";
                  const bookingType = booking
                    ? (getEventTypeLabel(booking.eventType, eventTypeOptions) || booking.packageName || "")
                    : "";
                  setForm((previous) => ({
                    ...previous,
                    bookingId: event.target.value,
                    title: booking ? `${bookingType} - ${clientName}` : "",
                  }));
                }}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                style={{ fontSize: "0.9rem" }}
                required
              >
                <option value="">Select a booking...</option>
                {availableBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.clientName || booking.client?.fullName || "Unknown"} — {getEventTypeLabel(booking.eventType, eventTypeOptions) || booking.packageName || ""} ({formatBookingDateTime(booking.eventDate || booking.date, booking.eventTime || booking.time, booking.eventTimezone || DEFAULT_BOOKING_TIMEZONE) || booking.date || booking.eventDate || ""})
                  </option>
                ))}
              </select>
            </div>

            {selectedBooking && (
              <div className="p-4 bg-brand-secondary/50 border border-brand-main/6">
                <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>
                  {selectedBooking.clientName || selectedBooking.client?.fullName || "Unknown"}
                </p>
                <p className="text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                  {getEventTypeLabel(selectedBooking.eventType, eventTypeOptions) || selectedBooking.packageName || ""} · {formatBookingDateTime(selectedBooking.eventDate || selectedBooking.date, selectedBooking.eventTime || selectedBooking.time, selectedBooking.eventTimezone || DEFAULT_BOOKING_TIMEZONE) || selectedBooking.date || selectedBooking.eventDate || ""} · {selectedBooking.location || selectedBooking.eventLocation || ""}
                </p>
              </div>
            )}

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>
                Gallery Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="e.g. Wedding Day, Engagement Session"
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                style={{ fontSize: "0.9rem" }}
                required
              />
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
                placeholder="Any notes about this gallery..."
                rows={3}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div className="bg-white border border-brand-main/8 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-brand-main uppercase tracking-[0.08em]" style={{ fontSize: "0.68rem" }}>
                Photos (optional)
              </p>
              <p className="text-brand-main/45" style={{ fontSize: "0.74rem" }}>
                {selectedFiles.length} selected
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={imageUploadAcceptList()}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => !isPending && fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="bg-brand-secondary border-2 border-dashed border-brand-main/15 p-8 text-center hover:border-brand-tertiary/40 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-brand-main/20 mx-auto mb-3" />
              <p className="text-brand-main/55 mb-1" style={{ fontSize: "0.86rem" }}>
                Drag & drop or click to upload gallery photos
              </p>
              <p className="text-brand-main/35" style={{ fontSize: "0.75rem" }}>
                JPG, PNG, WEBP, GIF, AVIF, HEIC/HEIF/TIFF/BMP
              </p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {previews.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative group aspect-square border border-brand-main/8 overflow-hidden">
                    <ImageWithFallback
                      src={preview}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-tertiary" />
                  <p className="text-brand-main/55" style={{ fontSize: "0.78rem" }}>
                    Uploading photo {uploadProgress.current} of {uploadProgress.total}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-brand-main/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-tertiary transition-all"
                    style={{
                      width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-red-700" style={{ fontSize: "0.8rem" }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
              style={{ fontSize: "0.65rem" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Create Gallery
                </>
              )}
            </button>
            <Link
              href="/admin/galleries"
              className="text-brand-main/40 hover:text-brand-main transition-colors"
              style={{ fontSize: "0.8rem" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>

      {!bookingsLoading && availableBookings.length === 0 && (
        <div className="mt-10 bg-white border border-brand-main/8 p-8 text-center">
          <ImageIcon className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/45" style={{ fontSize: "0.9rem" }}>
            No eligible bookings yet. A gallery can be created when a booking is pending full payment or pending delivery.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminGalleryNew() {
  return (
    <Suspense>
      <AdminGalleryNewContent />
    </Suspense>
  );
}
