"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  PlusCircle,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import {
  useAdminPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from "@/services/packages";
import { EventTypeItem, useEventTypes } from "@/services/event-types";

interface PackageItem {
  id: string;
  name: string;
  subtitle?: string;
  categoryLabel?: string;
  categoryDescription?: string;
  price: number | string;
  features?: string[];
  eventType: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

const emptyForm = {
  name: "",
  subtitle: "",
  categoryLabel: "",
  categoryDescription: "",
  price: "",
  features: "",
  eventType: "",
  isPopular: false,
  isActive: true,
  sortOrder: "0",
};

export default function AdminPricing() {
  const { data: packages = [], isLoading } = useAdminPackages();
  const { data: eventTypes = [] } = useEventTypes();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const packageList = packages as PackageItem[];
  const eventTypeOptions = eventTypes as EventTypeItem[];

  // Group packages by categoryLabel
  const grouped = packageList.reduce(
    (acc: Record<string, { description: string; packages: PackageItem[] }>, pkg) => {
      const label = pkg.categoryLabel || "Uncategorized";
      if (!acc[label]) {
        acc[label] = { description: pkg.categoryDescription || "", packages: [] };
      }
      acc[label].packages.push(pkg);
      return acc;
    },
    {} as Record<string, { description: string; packages: PackageItem[] }>
  );

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      eventType: eventTypeOptions[0]?.slug || "",
    });
    setShowForm(true);
  };

  const openEditForm = (pkg: PackageItem) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || "",
      subtitle: pkg.subtitle || "",
      categoryLabel: pkg.categoryLabel || "",
      categoryDescription: pkg.categoryDescription || "",
      price: String(pkg.price || ""),
      features: (pkg.features || []).join("\n"),
      eventType: pkg.eventType || eventTypeOptions[0]?.slug || "",
      isPopular: pkg.isPopular || false,
      isActive: pkg.isActive ?? true,
      sortOrder: String(pkg.sortOrder || 0),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      subtitle: form.subtitle || undefined,
      categoryLabel: form.categoryLabel || undefined,
      categoryDescription: form.categoryDescription || undefined,
      price: Number(form.price),
      features: form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      eventType: form.eventType,
      isPopular: form.isPopular,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    if (editingId) {
      updatePackage.mutate(
        { id: editingId, ...payload },
        { onSuccess: () => setShowForm(false) }
      );
    } else {
      createPackage.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this package?")) {
      deletePackage.mutate(id);
    }
  };

  const toggleActive = (pkg: PackageItem) => {
    updatePackage.mutate({ id: pkg.id, isActive: !pkg.isActive });
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 w-32 bg-brand-main/10 animate-pulse mb-1" />
          <div className="h-4 w-56 bg-brand-main/5 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-brand-main/8 p-5 h-20 animate-pulse"
            />
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
          <h1
            className="font-serif text-brand-main mb-1"
            style={{ fontSize: "1.8rem" }}
          >
            Pricing & Packages
          </h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
            Manage your photography packages shown on the public pricing page.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
          style={{ fontSize: "0.65rem" }}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add Package
        </button>
      </motion.div>

      {/* Grouped packages */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <DollarSign className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
            No packages yet. Add your first package to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([label, group]) => (
              <div key={label}>
                <div className="mb-3">
                  <h2
                    className="font-serif text-brand-main"
                    style={{ fontSize: "1.2rem" }}
                  >
                    {label}
                  </h2>
                  {group.description && (
                    <p
                      className="text-brand-main/40"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {group.packages.map((pkg, i) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`bg-white border border-brand-main/8 p-4 flex flex-wrap items-center gap-4 ${!pkg.isActive ? "opacity-50" : ""}`}
                    >
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3
                            className="text-brand-main"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {pkg.name}
                          </h3>
                          {pkg.isPopular && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-tertiary/10 text-brand-tertiary"
                              style={{ fontSize: "0.55rem" }}
                            >
                              <Star className="w-2.5 h-2.5" /> Popular
                            </span>
                          )}
                        </div>
                        {pkg.subtitle && (
                          <p
                            className="text-brand-main/40"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {pkg.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p
                          className="font-serif text-brand-main"
                          style={{ fontSize: "1.1rem" }}
                        >
                          ${Number(pkg.price).toLocaleString()}
                        </p>
                        <p
                          className="text-brand-main/30"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {(pkg.features || []).length} features
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(pkg)}
                          className="p-2 text-brand-main/30 hover:text-brand-main transition-colors"
                          title={pkg.isActive ? "Deactivate" : "Activate"}
                        >
                          {pkg.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditForm(pkg)}
                          className="p-2 text-brand-main/30 hover:text-brand-tertiary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-2 text-brand-main/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-brand-main/10 w-full max-w-lg mx-4 mb-16 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-serif text-brand-main"
                  style={{ fontSize: "1.2rem" }}
                >
                  {editingId ? "Edit Package" : "Add Package"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-brand-main/30 hover:text-brand-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Category Label *
                    </label>
                    <input
                      type="text"
                      value={form.categoryLabel}
                      onChange={(e) =>
                        setForm({ ...form, categoryLabel: e.target.value })
                      }
                      placeholder="e.g. Elopements"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Event Type
                    </label>
                    <select
                      value={form.eventType}
                      onChange={(e) =>
                        setForm({ ...form, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {eventTypeOptions.map((et) => (
                        <option key={et.slug} value={et.slug}>
                          {et.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-brand-main/50 mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Category Description
                  </label>
                  <input
                    type="text"
                    value={form.categoryDescription}
                    onChange={(e) =>
                      setForm({ ...form, categoryDescription: e.target.value })
                    }
                    placeholder="Brief description for this category..."
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Adventure"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) =>
                        setForm({ ...form, subtitle: e.target.value })
                      }
                      placeholder="e.g. For the bold & scenic"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="4200"
                      min="0"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm({ ...form, sortOrder: e.target.value })
                      }
                      min="0"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-brand-main/50 mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Features (one per line) *
                  </label>
                  <textarea
                    value={form.features}
                    onChange={(e) =>
                      setForm({ ...form, features: e.target.value })
                    }
                    placeholder={"Up to 5 hours of coverage\nOnline gallery with 250+ edited images\nPrint release included"}
                    rows={6}
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary resize-none"
                    style={{ fontSize: "0.85rem" }}
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) =>
                        setForm({ ...form, isPopular: e.target.checked })
                      }
                      className="w-4 h-4 accent-brand-tertiary"
                    />
                    <span
                      className="text-brand-main"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Most Popular
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="w-4 h-4 accent-brand-tertiary"
                    />
                    <span
                      className="text-brand-main"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Active (visible on public page)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={
                      createPackage.isPending || updatePackage.isPending
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {createPackage.isPending || updatePackage.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />{" "}
                        {editingId ? "Update Package" : "Create Package"}
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
    </div>
  );
}
