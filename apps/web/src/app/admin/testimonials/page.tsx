"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquareQuote,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
  TestimonialItem,
  useAdminTestimonials,
  useCreateTestimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from "@/services/testimonials";
import { EventTypeItem, useAdminEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";
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

type FilterMode = "all" | "published" | "draft" | "featured";

const emptyForm = {
  clientName: "",
  eventType: "",
  eventDate: "",
  content: "",
  rating: "5",
  sortOrder: "0",
  isFeatured: false,
  isPublished: false,
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "yyyy-MM-dd HH:mm");
  } catch {
    return "—";
  }
}

function truncate(value: string, maxLength = 140): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export default function AdminTestimonialsPage() {
  const { data: testimonials = [], isLoading } = useAdminTestimonials();
  const { data: eventTypes = [] } = useAdminEventTypes();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const testimonialList = testimonials as TestimonialItem[];
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const [filter, setFilter] = useState<FilterMode>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; clientName: string } | null>(null);

  const isSaving = createTestimonial.isPending || updateTestimonial.isPending;

  const filteredTestimonials = useMemo(() => {
    switch (filter) {
      case "published":
        return testimonialList.filter((item) => item.isPublished);
      case "draft":
        return testimonialList.filter((item) => !item.isPublished);
      case "featured":
        return testimonialList.filter((item) => item.isFeatured);
      default:
        return testimonialList;
    }
  }, [filter, testimonialList]);

  const openCreateForm = () => {
    const nextSortOrder =
      testimonialList.length > 0
        ? Math.max(...testimonialList.map((item) => item.sortOrder || 0)) + 1
        : 0;

    setEditingId(null);
    setForm({
      ...emptyForm,
      eventType: eventTypeOptions[0]?.slug || "",
      sortOrder: String(nextSortOrder),
    });
    setShowForm(true);
  };

  const openEditForm = (item: TestimonialItem) => {
    setEditingId(item.id);
    setForm({
      clientName: item.clientName || "",
      eventType: item.eventType || "",
      eventDate: item.eventDate ? String(item.eventDate).slice(0, 10) : "",
      content: item.content || "",
      rating: String(item.rating ?? 5),
      sortOrder: String(item.sortOrder ?? 0),
      isFeatured: !!item.isFeatured,
      isPublished: !!item.isPublished,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      clientName: form.clientName.trim(),
      eventType: form.eventType || undefined,
      eventDate: form.eventDate || undefined,
      content: form.content.trim(),
      rating: form.rating ? Number(form.rating) : undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
    };

    if (editingId) {
      updateTestimonial.mutate(
        { id: editingId, ...payload },
        { onSuccess: () => setShowForm(false) },
      );
    } else {
      createTestimonial.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTestimonial.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const togglePublished = (item: TestimonialItem) => {
    updateTestimonial.mutate({
      id: item.id,
      isPublished: !item.isPublished,
      isFeatured: !item.isPublished ? item.isFeatured : false,
    });
  };

  const toggleFeatured = (item: TestimonialItem) => {
    updateTestimonial.mutate({
      id: item.id,
      isFeatured: !item.isFeatured,
      isPublished: item.isPublished || !item.isFeatured,
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-52 bg-brand-main/10 animate-pulse mb-1" />
        <div className="h-4 w-80 bg-brand-main/5 animate-pulse mb-6" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="h-16 bg-white border border-brand-main/8 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>
            Testimonials
          </h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
            Review client feedback and control what appears on the public website.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
          style={{ fontSize: "0.65rem" }}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add Testimonial
        </button>
      </motion.div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {([
          { value: "all", label: "All" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
          { value: "featured", label: "Featured" },
        ] as Array<{ value: FilterMode; label: string }>).map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-3 py-1.5 transition-colors ${
              filter === item.value
                ? "bg-brand-main text-brand-secondary"
                : "bg-white border border-brand-main/10 text-brand-main/50 hover:text-brand-main"
            }`}
            style={{ fontSize: "0.7rem" }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-16 border border-brand-main/8 bg-white">
          <MessageSquareQuote className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
            No testimonials found for this filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-brand-main/8 bg-white">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-brand-main/8">
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Client</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Event Type</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Quote</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Rating</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Source</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Published</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Featured</th>
                <th className="text-left px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Updated</th>
                <th className="text-right px-4 py-3 text-brand-main/50" style={{ fontSize: "0.7rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimonials.map((item) => {
                const eventTypeLabel =
                  getEventTypeLabel(item.eventType || "", eventTypeOptions) ||
                  item.eventType ||
                  "—";
                const bookingLabel = item.booking?.packageName
                  ? `${item.booking.packageName}${item.booking?.eventDate ? ` · ${String(item.booking.eventDate).slice(0, 10)}` : ""}`
                  : item.bookingId
                    ? `Booking ${item.bookingId.slice(0, 8)}`
                    : "Manual";

                return (
                  <tr key={item.id} className="border-b border-brand-main/6 last:border-b-0">
                    <td className="px-4 py-3 text-brand-main" style={{ fontSize: "0.82rem" }}>
                      {item.clientName}
                    </td>
                    <td className="px-4 py-3 text-brand-main/60" style={{ fontSize: "0.8rem" }}>
                      {eventTypeLabel}
                    </td>
                    <td className="px-4 py-3 text-brand-main/60 max-w-[360px]" style={{ fontSize: "0.78rem" }}>
                      {truncate(item.content)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.max(1, Math.min(5, item.rating ?? 5)) }).map((_, index) => (
                          <Star key={`${item.id}-rating-${index}`} className="w-3 h-3 text-brand-tertiary fill-brand-tertiary" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-main/50" style={{ fontSize: "0.75rem" }}>
                      {bookingLabel}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(item)}
                        disabled={updateTestimonial.isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 transition-colors ${
                          item.isPublished
                            ? "text-green-700 bg-green-50"
                            : "text-amber-700 bg-amber-50"
                        }`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        {item.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(item)}
                        disabled={updateTestimonial.isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 transition-colors ${
                          item.isFeatured
                            ? "text-brand-tertiary bg-brand-tertiary/10"
                            : "text-brand-main/40 bg-brand-main/5"
                        }`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        <Star className={`w-3 h-3 ${item.isFeatured ? "fill-current" : ""}`} />
                        {item.isFeatured ? "Featured" : "Standard"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-brand-main/40" style={{ fontSize: "0.72rem" }}>
                      {formatDateTime(item.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-2 text-brand-main/30 hover:text-brand-tertiary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: item.id, clientName: item.clientName })}
                          className="p-2 text-brand-main/30 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-brand-main/10 w-full max-w-2xl mx-4 mb-16 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>
                  {editingId ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-brand-main/30 hover:text-brand-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                      Event Type
                    </label>
                    <select
                      value={form.eventType}
                      onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <option value="">Select event type</option>
                      {eventTypeOptions.map((eventType) => (
                        <option key={eventType.id} value={eventType.slug}>
                          {eventType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                      Rating (1-5)
                    </label>
                    <input
                      type="number"
                      value={form.rating}
                      onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                      min={1}
                      max={5}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                      min={0}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                    Testimonial *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary resize-none"
                    style={{ fontSize: "0.85rem", lineHeight: "1.65" }}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                      className="w-4 h-4 accent-brand-tertiary"
                    />
                    <span className="text-brand-main/70" style={{ fontSize: "0.8rem" }}>Published publicly</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 accent-brand-tertiary"
                    />
                    <span className="text-brand-main/70" style={{ fontSize: "0.8rem" }}>Mark as featured</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> {editingId ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 border border-brand-main/15 text-brand-main/50 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the testimonial from &ldquo;{deleteTarget?.clientName}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTestimonial.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
