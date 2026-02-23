"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useClients, useCreateClient } from "@/services/clients";
import { useCreateBooking } from "@/services/bookings";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { usePackages } from "@/services/packages";

interface ClientOption {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

interface PackageOption {
  id: string;
  name: string;
  price: number | string;
  eventType: string;
  isActive?: boolean;
}

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledClientId = searchParams.get("clientId") || "";

  const { data: clients } = useClients();
  const { data: eventTypes = [] } = useEventTypes();
  const { data: packages = [] } = usePackages();
  const createBooking = useCreateBooking();
  const createClient = useCreateClient();

  const [creatingNewClient, setCreatingNewClient] = useState(false);
  const [customPackage, setCustomPackage] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [newClientForm, setNewClientForm] = useState({ fullName: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientId: prefilledClientId,
    eventType: "",
    eventDate: "",
    eventLocation: "",
    packageName: "",
    packagePrice: "",
    depositAmount: "",
  });
  const clientOptions = (clients || []) as ClientOption[];
  const packageOptions = packages as PackageOption[];
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const filteredPackageOptions = packageOptions.filter((pkg) => {
    if (pkg.isActive === false) return false;
    if (!form.eventType) return false;
    return pkg.eventType === form.eventType;
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.eventType || !form.packageName || !form.packagePrice || !form.depositAmount) {
      setError("Please fill in all required fields.");
      return;
    }

    let clientId = form.clientId;

    if (creatingNewClient) {
      if (!newClientForm.fullName || !newClientForm.email) {
        setError("Client name and email are required.");
        return;
      }
      try {
        const newClient = await createClient.mutateAsync({
          fullName: newClientForm.fullName,
          email: newClientForm.email,
          phone: newClientForm.phone || undefined,
        });
        clientId = newClient.id;
      } catch {
        setError("Failed to create client.");
        return;
      }
    }

    if (!clientId) {
      setError("Please select or create a client.");
      return;
    }

    try {
      await createBooking.mutateAsync({
        clientId,
        eventType: form.eventType,
        eventDate: form.eventDate || undefined,
        eventLocation: form.eventLocation || undefined,
        packageName: form.packageName,
        packagePrice: Number(form.packagePrice),
        depositAmount: Number(form.depositAmount),
      });
      router.push("/admin/bookings");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create booking";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const isPending = createBooking.isPending || createClient.isPending;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/bookings" className="p-2 text-brand-main/40 hover:text-brand-main transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-brand-main" style={{ fontSize: "1.6rem" }}>New Booking</h1>
          <p className="text-brand-main/50 mt-1" style={{ fontSize: "0.8rem" }}>Create a new booking for a client</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Client */}
        <div className="bg-card border border-brand-main/10 p-6">
          <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-3" style={{ fontSize: "0.65rem" }}>
            Client *
          </label>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setCreatingNewClient(false)}
              className={`px-3 py-1.5 transition-colors ${!creatingNewClient ? "bg-brand-main text-brand-secondary" : "bg-brand-secondary border border-brand-main/10 text-brand-main/50"}`}
              style={{ fontSize: "0.7rem" }}
            >
              Existing Client
            </button>
            <button
              type="button"
              onClick={() => setCreatingNewClient(true)}
              className={`px-3 py-1.5 transition-colors ${creatingNewClient ? "bg-brand-main text-brand-secondary" : "bg-brand-secondary border border-brand-main/10 text-brand-main/50"}`}
              style={{ fontSize: "0.7rem" }}
            >
              New Client
            </button>
          </div>
          {creatingNewClient ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={newClientForm.fullName}
                onChange={(e) => setNewClientForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                style={{ fontSize: "0.85rem" }}
              />
              <input
                type="email"
                placeholder="Email *"
                value={newClientForm.email}
                onChange={(e) => setNewClientForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                style={{ fontSize: "0.85rem" }}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newClientForm.phone}
                onChange={(e) => setNewClientForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          ) : (
            <select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="">Select a client...</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.name || c.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Event Details */}
        <div className="bg-card border border-brand-main/10 p-6 space-y-4">
          <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-1" style={{ fontSize: "0.65rem" }}>
            Event Details
          </label>
          <div>
            <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Event Type *</label>
            <select
              value={form.eventType}
              onChange={(e) => {
                setSelectedPackageId("");
                setForm((f) => ({
                  ...f,
                  eventType: e.target.value,
                  packageName: "",
                  packagePrice: "",
                  depositAmount: "",
                }));
              }}
              className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="">Select type...</option>
              {eventTypeOptions.map((et) => (
                <option key={et.slug} value={et.slug}>{et.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Event Date</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Event Location</label>
            <input
              type="text"
              placeholder="e.g. Portland, OR"
              value={form.eventLocation}
              onChange={(e) => setForm((f) => ({ ...f, eventLocation: e.target.value }))}
              className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
        </div>

        {/* Package & Pricing */}
        <div className="bg-card border border-brand-main/10 p-6 space-y-4">
          <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-1" style={{ fontSize: "0.65rem" }}>
            Package & Pricing
          </label>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => {
                setCustomPackage(false);
                setSelectedPackageId("");
                setForm((f) => ({ ...f, packageName: "", packagePrice: "", depositAmount: "" }));
              }}
              className={`px-3 py-1.5 transition-colors ${!customPackage ? "bg-brand-main text-brand-secondary" : "bg-brand-secondary border border-brand-main/10 text-brand-main/50"}`}
              style={{ fontSize: "0.7rem" }}
            >
              Select Package
            </button>
            <button
              type="button"
              onClick={() => { setCustomPackage(true); setSelectedPackageId(""); setForm((f) => ({ ...f, packageName: "", packagePrice: "", depositAmount: "" })); }}
              className={`px-3 py-1.5 transition-colors ${customPackage ? "bg-brand-main text-brand-secondary" : "bg-brand-secondary border border-brand-main/10 text-brand-main/50"}`}
              style={{ fontSize: "0.7rem" }}
            >
              Add a custom package
            </button>
          </div>
          {!customPackage ? (
            <div>
              <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package *</label>
              <select
                value={selectedPackageId}
                disabled={!form.eventType}
                onChange={(e) => {
                  const pkg = filteredPackageOptions.find((p) => p.id === e.target.value);
                  setSelectedPackageId(e.target.value);
                  if (pkg) {
                    setForm((f) => ({
                      ...f,
                      packageName: pkg.name,
                      packagePrice: String(pkg.price),
                      depositAmount: String(Math.round(Number(pkg.price) * 0.3)),
                    }));
                  }
                }}
                className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                style={{ fontSize: "0.85rem" }}
              >
                <option value="">
                  {form.eventType ? "Select a package..." : "Select an event type first..."}
                </option>
                {filteredPackageOptions.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — ${Number(pkg.price).toLocaleString()}
                  </option>
                ))}
              </select>
              {!form.eventType && (
                <p className="mt-2 text-brand-main/50" style={{ fontSize: "0.75rem" }}>
                  Choose an event type to load saved packages, or use &ldquo;Add a custom package&rdquo;.
                </p>
              )}
              {form.eventType && filteredPackageOptions.length === 0 && (
                <p className="mt-2 text-brand-main/50" style={{ fontSize: "0.75rem" }}>
                  No saved packages for this event type. Use &ldquo;Add a custom package&rdquo;.
                </p>
              )}
              {selectedPackageId && (
                <div className="mt-3 p-3 bg-brand-secondary border border-brand-main/8 space-y-1">
                  <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{form.packageName}</p>
                  <p className="text-brand-main/50" style={{ fontSize: "0.8rem" }}>Price: ${Number(form.packagePrice).toLocaleString()}</p>
                  <div className="mt-2">
                    <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Deposit Amount ($) *</label>
                    <input
                      type="number"
                      min="0"
                      value={form.depositAmount}
                      onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Signature"
                  value={form.packageName}
                  onChange={(e) => setForm((f) => ({ ...f, packageName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package Price ($) *</label>
                  <input
                    type="number"
                    placeholder="5800"
                    min="0"
                    value={form.packagePrice}
                    onChange={(e) => setForm((f) => ({ ...f, packagePrice: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Deposit Amount ($) *</label>
                  <input
                    type="number"
                    placeholder="1740"
                    min="0"
                    value={form.depositAmount}
                    onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary tracking-[0.1em] uppercase hover:bg-brand-main/90 transition-colors disabled:opacity-50"
            style={{ fontSize: "0.7rem" }}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Create Booking</>
            )}
          </button>
          <Link
            href="/admin/bookings"
            className="px-6 py-3 border border-brand-main/15 text-brand-main/50 hover:text-brand-main hover:border-brand-main/30 transition-colors"
            style={{ fontSize: "0.7rem" }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-8 bg-brand-main/10 rounded w-1/4 mb-8" />
          <div className="h-64 bg-brand-main/10 rounded" />
        </div>
      }
    >
      <NewBookingForm />
    </Suspense>
  );
}
