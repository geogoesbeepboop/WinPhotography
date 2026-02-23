"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";
import { useBookings } from "@/services/bookings";
import { useCreateGallery } from "@/services/galleries";

interface BookingOption {
  id: string;
  status: string;
  clientName?: string;
  client?: { fullName?: string };
  eventType?: string;
  packageName?: string;
  date?: string;
  eventDate?: string;
  location?: string;
  eventLocation?: string;
}

function AdminGalleryNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBooking = searchParams.get("booking") || "";

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const createGallery = useCreateGallery();

  const [form, setForm] = useState({
    bookingId: preselectedBooking,
    title: "",
    notes: "",
  });

  const bookingOptions = bookings as BookingOption[];
  const availableBookings = bookingOptions.filter(
    (b) => b.status === "completed" || b.status === "confirmed",
  );

  const selectedBooking = availableBookings.find((b) => b.id === form.bookingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGallery.mutate(
      { bookingId: form.bookingId, title: form.title, description: form.notes },
      {
        onSuccess: () => {
          router.push("/admin/galleries");
        },
      }
    );
  };

  if (bookingsLoading) {
    return (
      <div>
        <div className="h-4 w-32 bg-brand-main/10 animate-pulse mb-6" />
        <div className="h-8 w-48 bg-brand-main/10 animate-pulse mb-2" />
        <div className="h-4 w-72 bg-brand-main/5 animate-pulse mb-8" />
        <div className="max-w-2xl bg-white border border-brand-main/8 p-6 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-brand-main/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/galleries" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Galleries
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Create Gallery</h1>
        <p className="text-brand-main/50 mb-8" style={{ fontSize: "0.9rem" }}>Set up a new photo gallery for a client booking.</p>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white border border-brand-main/8 p-6 space-y-5">
            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Linked Booking *</label>
              <select
                value={form.bookingId}
                onChange={(e) => {
                  const bk = availableBookings.find((b) => b.id === e.target.value);
                  const clientName = bk ? (bk.clientName || bk.client?.fullName || "") : "";
                  const bookingType = bk ? (bk.eventType || bk.packageName || "") : "";
                  setForm({ ...form, bookingId: e.target.value, title: bk ? `${bookingType} - ${clientName}` : "" });
                }}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                style={{ fontSize: "0.9rem" }}
                required
              >
                <option value="">Select a booking...</option>
                {availableBookings.map((bk) => (
                  <option key={bk.id} value={bk.id}>
                    {bk.clientName || bk.client?.fullName || "Unknown"} — {bk.eventType || bk.packageName || ""} ({bk.date || bk.eventDate || ""})
                  </option>
                ))}
              </select>
            </div>

            {selectedBooking && (
              <div className="p-4 bg-brand-secondary/50 border border-brand-main/6">
                <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{selectedBooking.clientName || selectedBooking.client?.fullName || "Unknown"}</p>
                <p className="text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                  {selectedBooking.eventType || selectedBooking.packageName || ""} · {selectedBooking.date || selectedBooking.eventDate || ""} · {selectedBooking.location || selectedBooking.eventLocation || ""}
                </p>
              </div>
            )}

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Gallery Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Wedding Day, Engagement Session"
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.9rem" }}
                required
              />
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes about this gallery..."
                rows={3}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none" style={{ fontSize: "0.85rem" }}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit"
                disabled={createGallery.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50" style={{ fontSize: "0.65rem" }}>
                <Save className="w-3.5 h-3.5" /> {createGallery.isPending ? "Creating..." : "Create Gallery"}
              </button>
              <Link href="/admin/galleries" className="text-brand-main/40 hover:text-brand-main transition-colors" style={{ fontSize: "0.8rem" }}>Cancel</Link>
            </div>
          </div>
        </form>
      </motion.div>
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
