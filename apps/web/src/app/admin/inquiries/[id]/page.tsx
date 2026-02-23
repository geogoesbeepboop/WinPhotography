"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Phone, Calendar, Tag, MessageSquare, Send, CalendarPlus, Archive, CheckCircle2, X, Loader2 } from "lucide-react";
import { inquiryStatusConfig } from "@/lib/mock-data/admin-data";
import { useInquiry, useUpdateInquiry, useConvertInquiry } from "@/services/inquiries";
import { useClients, useCreateClient } from "@/services/clients";
import { apiClient } from "@/lib/api-client";
import { useAdminPackages } from "@/services/packages";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";

const defaultStatusCfg = { label: "Unknown", color: "bg-gray-100 text-gray-500" };

// Combined status options for both mock and API
const allStatusOptions = [
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "converted", label: "Converted" },
  { value: "archived", label: "Archived" },
];

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

function formatReceivedTimestamp(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: inquiry, isLoading } = useInquiry(id as string);
  const updateInquiry = useUpdateInquiry();

  const convertInquiry = useConvertInquiry();
  const { data: clients } = useClients();
  const { data: packages = [] } = useAdminPackages();
  const { data: eventTypes = [] } = useEventTypes();
  const createClient = useCreateClient();

  const [status, setStatus] = useState<string>("new");
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");
  const [showReplyConfirm, setShowReplyConfirm] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [creatingNewClient, setCreatingNewClient] = useState(false);
  const [useCustomPackage, setUseCustomPackage] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [newClientForm, setNewClientForm] = useState({ fullName: "", email: "", phone: "" });
  const [convertForm, setConvertForm] = useState({
    clientId: "",
    packageName: "",
    packagePrice: "",
    depositAmount: "",
  });
  const clientOptions = (clients || []) as ClientOption[];
  const packageOptions = packages as PackageOption[];
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const inquiryEventType = (inquiry?.eventType || inquiry?.category || "") as string;
  const filteredPackageOptions = packageOptions.filter((pkg) => {
    if (pkg.isActive === false) return false;
    if (!inquiryEventType) return false;
    return pkg.eventType === inquiryEventType;
  });

  // Sync local state when inquiry data arrives
  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status || "new");
      setNotes(inquiry.notes || inquiry.adminNotes || "");
    }
  }, [inquiry]);

  // Persist status change via mutation
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (inquiry?.id) {
      updateInquiry.mutate({ id: inquiry.id, status: newStatus });
    }
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    setShowReplyConfirm(true);
  };

  const confirmSendReply = async () => {
    if (!inquiry?.id || !reply.trim()) return;
    setSendingReply(true);
    setReplyError("");
    try {
      await apiClient.post(`/inquiries/${inquiry.id}/reply`, { message: reply.trim() });
      setReply("");
      setShowReplyConfirm(false);
      // Status will be updated on the backend automatically
      setStatus("contacted");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send reply. Please try again.";
      setReplyError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSaveNotes = () => {
    if (inquiry?.id) {
      updateInquiry.mutate({ id: inquiry.id, adminNotes: notes });
    }
  };

  const handleArchive = () => {
    handleStatusChange("archived");
  };

  const handleConvert = async () => {
    if (!inquiry?.id || !convertForm.packageName || !convertForm.packagePrice || !convertForm.depositAmount) return;

    let clientId = convertForm.clientId;

    // If creating a new client, do that first
    if (creatingNewClient) {
      if (!newClientForm.fullName || !newClientForm.email) return;
      try {
        const newClient = await createClient.mutateAsync({
          fullName: newClientForm.fullName,
          email: newClientForm.email,
          phone: newClientForm.phone || undefined,
        });
        clientId = newClient.id;
      } catch {
        return; // createClient error will show via isError
      }
    }

    if (!clientId) return;

    convertInquiry.mutate(
      {
        id: inquiry.id,
        clientId,
        packageName: convertForm.packageName,
        packagePrice: Number(convertForm.packagePrice),
        depositAmount: Number(convertForm.depositAmount),
      },
      {
        onSuccess: () => {
          setShowConvertModal(false);
          router.push("/admin/bookings");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-4 w-32 bg-brand-main/5 animate-pulse mb-6" />
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="h-8 w-56 bg-brand-main/5 animate-pulse mb-2" />
            <div className="h-4 w-40 bg-brand-main/5 animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-brand-main/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="h-5 w-40 bg-brand-main/5 animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-brand-main/5 animate-pulse" />
                <div className="h-4 w-3/4 bg-brand-main/5 animate-pulse" />
              </div>
            </div>
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="h-5 w-32 bg-brand-main/5 animate-pulse mb-4" />
              <div className="h-28 w-full bg-brand-main/5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white border border-brand-main/8 p-5">
              <div className="h-3 w-24 bg-brand-main/5 animate-pulse mb-3" />
              <div className="space-y-3">
                <div className="h-4 w-48 bg-brand-main/5 animate-pulse" />
                <div className="h-4 w-36 bg-brand-main/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Inquiry Not Found</h1>
        <Link href="/admin/inquiries" className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors" style={{ fontSize: "0.85rem" }}>Back to Inquiries</Link>
      </div>
    );
  }

  const cfg = inquiryStatusConfig[status] || defaultStatusCfg;

  // Normalize field names for both mock and API data
  const name = inquiry.name || inquiry.contactName || "Unknown";
  const email = inquiry.email || inquiry.contactEmail || "";
  const phone = inquiry.phone || inquiry.contactPhone || "";
  const category = getEventTypeLabel(
    inquiry.category || inquiry.eventType || "",
    eventTypeOptions,
  );
  const tier = inquiry.tier || "";
  const preferredDate = inquiry.preferredDate || inquiry.eventDate || "";

  return (
    <div>
      <Link href="/admin/inquiries" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Inquiries
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-brand-main" style={{ fontSize: "1.8rem" }}>{name}</h1>
              <span className={`px-3 py-1 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>
            </div>
            <p className="text-brand-main/40" style={{ fontSize: "0.85rem" }}>
              Received {formatReceivedTimestamp(inquiry.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.8rem" }}
            >
              {allStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message */}
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-brand-tertiary" />
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>Inquiry Message</h2>
              </div>
              <p className="text-brand-main/70" style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>{inquiry.message}</p>
            </div>

            {/* Reply */}
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-brand-tertiary" />
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>Send Reply</h2>
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply to this inquiry..."
                rows={5}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none mb-3"
                style={{ fontSize: "0.9rem" }}
              />
              {replyError && (
                <p className="text-red-600 mb-3" style={{ fontSize: "0.8rem" }}>{replyError}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendReply}
                  disabled={!reply.trim() || sendingReply}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-40"
                  style={{ fontSize: "0.65rem" }}
                >
                  {sendingReply ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Reply</>
                  )}
                </button>
                <span className="text-brand-main/30" style={{ fontSize: "0.75rem" }}>
                  Sends an email to {inquiry.contactEmail}
                </span>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white border border-brand-main/8 p-6">
              <h2 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.1rem" }}>Internal Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add private notes about this inquiry..."
                rows={3}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Contact Info</p>
              <div className="space-y-3">
                <a href={`mailto:${email}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                  <Mail className="w-4 h-4 text-brand-main/30" /> {email}
                </a>
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                    <Phone className="w-4 h-4 text-brand-main/30" /> {phone}
                  </a>
                )}
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Session Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                  <Tag className="w-4 h-4 text-brand-main/30" /> {category}{tier ? ` · ${tier}` : ""}
                </div>
                {preferredDate && (
                  <div className="flex items-center gap-2 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                    <Calendar className="w-4 h-4 text-brand-main/30" /> Preferred: {preferredDate}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setConvertForm({ clientId: "", packageName: "", packagePrice: "", depositAmount: "" });
                    setUseCustomPackage(false);
                    setSelectedPackageId("");
                    setCreatingNewClient(false);
                    setNewClientForm({ fullName: name, email, phone });
                    setShowConvertModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-tertiary text-white hover:bg-brand-tertiary-dark transition-colors tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Convert to Booking
                </button>
                <button
                  onClick={handleArchive}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-main/15 text-brand-main/50 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                  style={{ fontSize: "0.7rem" }}
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reply Confirmation Dialog */}
      {showReplyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReplyConfirm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-brand-main/10 p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>Confirm Reply</h3>
              <button onClick={() => setShowReplyConfirm(false)} className="text-brand-main/30 hover:text-brand-main"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-brand-main/60 mb-3" style={{ fontSize: "0.85rem" }}>
              You are about to send the following reply to <strong>{inquiry?.contactEmail}</strong>:
            </p>
            <div className="bg-brand-secondary border border-brand-main/8 p-4 mb-4 max-h-40 overflow-y-auto">
              <p className="text-brand-main/70 whitespace-pre-wrap" style={{ fontSize: "0.85rem", lineHeight: "1.7" }}>{reply}</p>
            </div>
            {replyError && (
              <p className="text-red-600 mb-3" style={{ fontSize: "0.8rem" }}>{replyError}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReplyConfirm(false)}
                className="px-4 py-2 text-brand-main/50 hover:text-brand-main transition-colors"
                style={{ fontSize: "0.8rem" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSendReply}
                disabled={sendingReply}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
                style={{ fontSize: "0.65rem" }}
              >
                {sendingReply ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Confirm & Send</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConvertModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-brand-main/10 w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>Convert to Booking</h2>
              <button onClick={() => setShowConvertModal(false)} className="text-brand-main/30 hover:text-brand-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Select or Create */}
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Client *</label>
                <div className="flex items-center gap-2 mb-2">
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
                  <div className="space-y-2 p-3 bg-brand-secondary border border-brand-main/10">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newClientForm.fullName}
                      onChange={(e) => setNewClientForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={newClientForm.email}
                      onChange={(e) => setNewClientForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                    {createClient.isError && (
                      <p className="text-red-600" style={{ fontSize: "0.75rem" }}>Failed to create client.</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={convertForm.clientId}
                    onChange={(e) => setConvertForm((f) => ({ ...f, clientId: e.target.value }))}
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

              {/* Package Selection */}
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package *</label>
                {!useCustomPackage ? (
                  <>
                    <select
                      value={selectedPackageId}
                      disabled={!inquiryEventType}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setSelectedPackageId(selectedId);
                        const pkg = filteredPackageOptions.find((p) => p.id === selectedId);
                        if (pkg) {
                          const price = Number(pkg.price);
                          setConvertForm((f) => ({
                            ...f,
                            packageName: pkg.name,
                            packagePrice: String(price),
                            depositAmount: String(Math.round(price * 0.3)),
                          }));
                        } else {
                          setConvertForm((f) => ({
                            ...f,
                            packageName: "",
                            packagePrice: "",
                            depositAmount: "",
                          }));
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <option value="">
                        {inquiryEventType ? "Select a package..." : "Inquiry has no event type"}
                      </option>
                      {filteredPackageOptions.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — ${Number(pkg.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                    {!inquiryEventType && (
                      <p className="mt-2 text-brand-main/50" style={{ fontSize: "0.75rem" }}>
                        This inquiry has no event type. Use &ldquo;Add a custom package&rdquo;.
                      </p>
                    )}
                    {inquiryEventType && filteredPackageOptions.length === 0 && (
                      <p className="mt-2 text-brand-main/50" style={{ fontSize: "0.75rem" }}>
                        No saved packages for this event type. Use &ldquo;Add a custom package&rdquo;.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={convertForm.packageName}
                      onChange={(e) => setConvertForm((f) => ({ ...f, packageName: e.target.value }))}
                      placeholder="Package name"
                      className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={convertForm.packagePrice}
                        onChange={(e) => setConvertForm((f) => ({ ...f, packagePrice: e.target.value }))}
                        placeholder="Price ($)"
                        min="0"
                        className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                        style={{ fontSize: "0.85rem" }}
                      />
                      <input
                        type="number"
                        value={convertForm.depositAmount}
                        onChange={(e) => setConvertForm((f) => ({ ...f, depositAmount: e.target.value }))}
                        placeholder="Deposit ($)"
                        min="0"
                        className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const next = !useCustomPackage;
                    setUseCustomPackage(next);
                    setSelectedPackageId("");
                    setConvertForm((f) => ({
                      ...f,
                      packageName: "",
                      packagePrice: "",
                      depositAmount: "",
                    }));
                  }}
                  className="mt-2 text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
                  style={{ fontSize: "0.75rem" }}
                >
                  {useCustomPackage ? "Use a saved package" : "Add a custom package"}
                </button>
              </div>

              {!useCustomPackage && selectedPackageId && (
                <div>
                  <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Deposit Amount ($) *</label>
                  <input
                    type="number"
                    value={convertForm.depositAmount}
                    onChange={(e) => setConvertForm((f) => ({ ...f, depositAmount: e.target.value }))}
                    min="0"
                    className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleConvert}
                disabled={convertInquiry.isPending || createClient.isPending || (!creatingNewClient && !convertForm.clientId) || (creatingNewClient && (!newClientForm.fullName || !newClientForm.email)) || !convertForm.packageName || !convertForm.packagePrice || !convertForm.depositAmount}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-tertiary text-white hover:bg-brand-tertiary-dark transition-colors tracking-[0.1em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "0.65rem" }}
              >
                {(convertInquiry.isPending || createClient.isPending) ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Converting...</>
                ) : (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Create Booking</>
                )}
              </button>
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-5 py-2.5 border border-brand-main/15 text-brand-main/50 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                style={{ fontSize: "0.7rem" }}
              >
                Cancel
              </button>
            </div>

            {convertInquiry.isError && (
              <p className="mt-3 text-red-600" style={{ fontSize: "0.8rem" }}>
                Failed to convert inquiry. Please try again.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
