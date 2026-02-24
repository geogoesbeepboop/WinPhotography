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
} from "lucide-react";
import {
  PackageItem,
  PricingAddOnItem,
  useAdminPackages,
  useAdminPricingAddOns,
  useCreatePackage,
  useCreatePricingAddOn,
  useUpdatePackage,
  useUpdatePricingAddOn,
  useDeletePackage,
  useDeletePricingAddOn,
} from "@/services/packages";
import { useAdminEventTypes } from "@/services/event-types";
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

const emptyAddOnForm = {
  name: "",
  description: "",
  price: "",
  priceSuffix: "",
  eventType: "",
  isActive: true,
  sortOrder: "0",
};

export default function AdminPricing() {
  const { data: packages = [], isLoading } = useAdminPackages();
  const { data: addOns = [], isLoading: addOnsLoading } = useAdminPricingAddOns();
  const { data: eventTypes = [] } = useAdminEventTypes();
  const createPackage = useCreatePackage();
  const createAddOn = useCreatePricingAddOn();
  const updatePackage = useUpdatePackage();
  const updateAddOn = useUpdatePricingAddOn();
  const deletePackage = useDeletePackage();
  const deleteAddOn = useDeletePricingAddOn();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [editingAddOnId, setEditingAddOnId] = useState<string | null>(null);
  const [addOnForm, setAddOnForm] = useState(emptyAddOnForm);
  const [deleteAddOnTarget, setDeleteAddOnTarget] = useState<{ id: string; name: string } | null>(null);
  const packageList = packages;
  const addOnList = addOns;
  const eventTypeOptions = eventTypes;

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

  const openCreateAddOnForm = () => {
    setEditingAddOnId(null);
    setAddOnForm({
      ...emptyAddOnForm,
      eventType: "",
    });
    setShowAddOnForm(true);
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

  const openEditAddOnForm = (addOn: PricingAddOnItem) => {
    setEditingAddOnId(addOn.id);
    setAddOnForm({
      name: addOn.name || "",
      description: addOn.description || "",
      price: String(addOn.price || ""),
      priceSuffix: addOn.priceSuffix || "",
      eventType: addOn.eventType || "",
      isActive: addOn.isActive ?? true,
      sortOrder: String(addOn.sortOrder || 0),
    });
    setShowAddOnForm(true);
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

  const handleSubmitAddOn = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: addOnForm.name,
      description: addOnForm.description || undefined,
      price: Number(addOnForm.price),
      priceSuffix: addOnForm.priceSuffix || undefined,
      eventType: addOnForm.eventType || undefined,
      isActive: addOnForm.isActive,
      sortOrder: Number(addOnForm.sortOrder) || 0,
    };

    if (editingAddOnId) {
      updateAddOn.mutate(
        { id: editingAddOnId, ...payload },
        { onSuccess: () => setShowAddOnForm(false) },
      );
    } else {
      createAddOn.mutate(payload, { onSuccess: () => setShowAddOnForm(false) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePackage.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleDeleteAddOn = () => {
    if (!deleteAddOnTarget) return;
    deleteAddOn.mutate(deleteAddOnTarget.id, {
      onSuccess: () => setDeleteAddOnTarget(null),
    });
  };

  const toggleActive = (pkg: PackageItem) => {
    updatePackage.mutate({ id: pkg.id, isActive: !pkg.isActive });
  };

  const toggleAddOnActive = (addOn: PricingAddOnItem) => {
    updateAddOn.mutate({ id: addOn.id, isActive: !(addOn.isActive ?? true) });
  };

  const formatAddOnPrice = (addOn: PricingAddOnItem): string => {
    const numericValue =
      typeof addOn.price === "number" ? addOn.price : Number.parseFloat(String(addOn.price));
    if (Number.isFinite(numericValue)) {
      const hasDecimals = Math.round(numericValue * 100) % 100 !== 0;
      return `$${numericValue.toLocaleString("en-US", {
        maximumFractionDigits: hasDecimals ? 2 : 0,
        minimumFractionDigits: hasDecimals ? 2 : 0,
      })}${addOn.priceSuffix || ""}`;
    }
    return `${String(addOn.price)}${addOn.priceSuffix || ""}`;
  };

  if (isLoading || addOnsLoading) {
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
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
            style={{ fontSize: "0.65rem" }}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Package
          </button>
          <button
            onClick={openCreateAddOnForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-main/15 text-brand-main hover:border-brand-main/30 transition-colors tracking-[0.1em] uppercase"
            style={{ fontSize: "0.65rem" }}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Add-On
          </button>
        </div>
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
                          onClick={() => setDeleteTarget({ id: pkg.id, name: pkg.name })}
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

      {/* Add-ons */}
      <div className="mt-12 pt-8 border-t border-brand-main/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-brand-main" style={{ fontSize: "1.3rem" }}>
              Add-Ons & Extras
            </h2>
            <p className="text-brand-main/45" style={{ fontSize: "0.8rem" }}>
              Manage add-ons shown on the public pricing page.
            </p>
          </div>
          <button
            onClick={openCreateAddOnForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
            style={{ fontSize: "0.65rem" }}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Add-On
          </button>
        </div>

        {addOnList.length === 0 ? (
          <div className="text-center py-12 bg-white border border-brand-main/8">
            <p className="text-brand-main/45" style={{ fontSize: "0.9rem" }}>
              No add-ons yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {addOnList.map((addOn, i) => (
              <motion.div
                key={addOn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white border border-brand-main/8 p-4 flex flex-wrap items-center gap-4 ${addOn.isActive === false ? "opacity-50" : ""}`}
              >
                <div className="flex-1 min-w-[220px]">
                  <h3 className="text-brand-main" style={{ fontSize: "0.95rem" }}>
                    {addOn.name}
                  </h3>
                  <p className="text-brand-main/40 mt-0.5" style={{ fontSize: "0.75rem" }}>
                    {addOn.description || "No description"}
                  </p>
                  <p className="text-brand-main/35 mt-0.5" style={{ fontSize: "0.7rem" }}>
                    {addOn.eventType
                      ? getEventTypeLabel(addOn.eventType, eventTypeOptions) || addOn.eventType
                      : "All Event Types"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>
                    {formatAddOnPrice(addOn)}
                  </p>
                  <p className="text-brand-main/30" style={{ fontSize: "0.65rem" }}>
                    Sort {addOn.sortOrder ?? 0}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAddOnActive(addOn)}
                    className="p-2 text-brand-main/30 hover:text-brand-main transition-colors"
                    title={addOn.isActive === false ? "Activate" : "Deactivate"}
                  >
                    {addOn.isActive === false ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditAddOnForm(addOn)}
                    className="p-2 text-brand-main/30 hover:text-brand-tertiary transition-colors"
                    title="Edit add-on"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteAddOnTarget({ id: addOn.id, name: addOn.name })
                    }
                    className="p-2 text-brand-main/30 hover:text-red-500 transition-colors"
                    title="Delete add-on"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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

      {/* Add-On Create/Edit Modal */}
      <AnimatePresence>
        {showAddOnForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 overflow-y-auto"
            onClick={() => setShowAddOnForm(false)}
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
                  {editingAddOnId ? "Edit Add-On" : "Add Add-On"}
                </h2>
                <button
                  onClick={() => setShowAddOnForm(false)}
                  className="text-brand-main/30 hover:text-brand-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAddOn} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Add-On Name *
                    </label>
                    <input
                      type="text"
                      value={addOnForm.name}
                      onChange={(e) =>
                        setAddOnForm({ ...addOnForm, name: e.target.value })
                      }
                      placeholder="e.g. Second Photographer"
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
                      value={addOnForm.eventType}
                      onChange={(e) =>
                        setAddOnForm({ ...addOnForm, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <option value="">All Event Types</option>
                      {eventTypeOptions.map((eventType) => (
                        <option key={eventType.id} value={eventType.slug}>
                          {eventType.name}
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
                    Description
                  </label>
                  <textarea
                    value={addOnForm.description}
                    onChange={(e) =>
                      setAddOnForm({ ...addOnForm, description: e.target.value })
                    }
                    placeholder="Optional details shown on the pricing page..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary resize-none"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-brand-main/50 mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={addOnForm.price}
                      onChange={(e) =>
                        setAddOnForm({ ...addOnForm, price: e.target.value })
                      }
                      min="0"
                      step="0.01"
                      placeholder="400"
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
                      Price Suffix
                    </label>
                    <input
                      type="text"
                      value={addOnForm.priceSuffix}
                      onChange={(e) =>
                        setAddOnForm({
                          ...addOnForm,
                          priceSuffix: e.target.value,
                        })
                      }
                      placeholder="/hr"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
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
                      value={addOnForm.sortOrder}
                      onChange={(e) =>
                        setAddOnForm({ ...addOnForm, sortOrder: e.target.value })
                      }
                      min="0"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="add-on-active"
                    type="checkbox"
                    checked={addOnForm.isActive}
                    onChange={(e) =>
                      setAddOnForm({ ...addOnForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-brand-tertiary"
                  />
                  <label
                    htmlFor="add-on-active"
                    className="text-brand-main"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Active (visible on public page)
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createAddOn.isPending || updateAddOn.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {createAddOn.isPending || updateAddOn.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        {editingAddOnId ? "Update Add-On" : "Create Add-On"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOnForm(false)}
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
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletePackage.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteAddOnTarget}
        onOpenChange={() => setDeleteAddOnTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Add-On</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteAddOnTarget?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddOn}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteAddOn.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
