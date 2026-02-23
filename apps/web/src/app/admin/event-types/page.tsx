"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tag,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Loader2,
} from "lucide-react";
import {
  EventTypeItem,
  useAdminEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from "@/services/event-types";
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

const emptyForm = { name: "", isActive: true, sortOrder: "0" };

export default function AdminEventTypesPage() {
  const { data: eventTypes = [], isLoading } = useAdminEventTypes();
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();
  const deleteEventType = useDeleteEventType();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [formError, setFormError] = useState("");
  const eventTypeList = eventTypes as EventTypeItem[];

  const openCreateForm = () => {
    const nextSortOrder =
      eventTypeList.length > 0
        ? Math.max(...eventTypeList.map((eventType) => eventType.sortOrder || 0)) + 1
        : 0;
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: String(nextSortOrder) });
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (et: EventTypeItem) => {
    setEditingId(et.id);
    setForm({
      name: et.name || "",
      isActive: et.isActive ?? true,
      sortOrder: String(et.sortOrder || 0),
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sortOrder = Number(form.sortOrder);
    if (Number.isNaN(sortOrder) || sortOrder < 0) {
      setFormError("Sort order must be a non-negative number.");
      return;
    }

    const duplicateSortOrder = eventTypeList.find(
      (eventType) =>
        eventType.sortOrder === sortOrder &&
        eventType.id !== editingId,
    );
    if (duplicateSortOrder) {
      setFormError(
        `Sort order #${sortOrder} is already used by "${duplicateSortOrder.name}".`,
      );
      return;
    }

    const payload = {
      name: form.name,
      isActive: form.isActive,
      sortOrder,
    };

    if (editingId) {
      updateEventType.mutate(
        { id: editingId, ...payload },
        {
          onSuccess: () => setShowForm(false),
          onError: (error: any) => {
            const msg = error?.response?.data?.message || "Failed to update event type.";
            setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
          },
        },
      );
    } else {
      createEventType.mutate(payload, {
        onSuccess: () => setShowForm(false),
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Failed to create event type.";
          setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
        },
      });
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteEventType.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const toggleActive = (et: EventTypeItem) => {
    updateEventType.mutate({ id: et.id, isActive: !et.isActive });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-40 bg-brand-main/10 animate-pulse mb-1" />
        <div className="h-4 w-64 bg-brand-main/5 animate-pulse mb-6" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-brand-main/8 p-4 h-14 animate-pulse" />
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
            Event Types
          </h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
            Manage the event types used across inquiries, bookings, portfolio, and packages.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
          style={{ fontSize: "0.65rem" }}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add Event Type
        </button>
      </motion.div>

      {eventTypeList.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
            No event types yet. They will be auto-seeded when the API starts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {eventTypeList.map((et, i) => (
            <motion.div
              key={et.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white border border-brand-main/8 p-4 flex items-center gap-4 ${!et.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-brand-main" style={{ fontSize: "0.95rem" }}>
                  {et.name}
                </h3>
              </div>
              <span className="text-brand-main/20" style={{ fontSize: "0.7rem" }}>
                #{et.sortOrder}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(et)}
                  className="p-2 text-brand-main/30 hover:text-brand-main transition-colors"
                  title={et.isActive ? "Deactivate" : "Activate"}
                >
                  {et.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditForm(et)}
                  className="p-2 text-brand-main/30 hover:text-brand-tertiary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: et.id, name: et.name })}
                  className="p-2 text-brand-main/30 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-brand-main/10 w-full max-w-md mx-4 mb-16 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>
                  {editingId ? "Edit Event Type" : "Add Event Type"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-brand-main/30 hover:text-brand-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <p className="text-red-600" style={{ fontSize: "0.8rem" }}>
                    {formError}
                  </p>
                )}
                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                    Event Type Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Wedding"
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                  />
                  <p className="mt-1 text-brand-main/40" style={{ fontSize: "0.7rem" }}>
                    Must be unique.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-brand-tertiary"
                  />
                  <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>Active</span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createEventType.isPending || updateEventType.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {createEventType.isPending || updateEventType.isPending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-3.5 h-3.5" /> {editingId ? "Update" : "Create"}</>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This may affect existing bookings and portfolio items that reference this event type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteEventType.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
