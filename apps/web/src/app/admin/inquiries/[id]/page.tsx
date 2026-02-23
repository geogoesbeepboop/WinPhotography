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

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: inquiry, isLoading } = useInquiry(id as string);
  const updateInquiry = useUpdateInquiry();

  const convertInquiry = useConvertInquiry();
  const { data: clients } = useClients();
  const createClient = useCreateClient();

  const [status, setStatus] = useState<string>("new");
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [creatingNewClient, setCreatingNewClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ fullName: "", email: "", phone: "" });
  const [convertForm, setConvertForm] = useState({
    clientId: "",
    packageName: "",
    packagePrice: "",
    depositAmount: "",
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
    setReply("");
    handleStatusChange("responded");
  };

  const handleSaveNotes = () => {
    if (inquiry?.id) {
      updateInquiry.mutate({ id: inquiry.id, notes });
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
  const category = inquiry.category || inquiry.eventType || "";
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
            <p className="text-brand-main/40" style={{ fontSize: "0.85rem" }}>Received {inquiry.createdAt}</p>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendReply}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
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
                    setConvertForm({ clientId: "", packageName: category || "", packagePrice: "", depositAmount: "" });
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
                    {(clients || []).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName || c.name || c.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Package Name */}
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package Name *</label>
                <input
                  type="text"
                  value={convertForm.packageName}
                  onChange={(e) => setConvertForm((f) => ({ ...f, packageName: e.target.value }))}
                  placeholder="e.g. Wedding Premium"
                  className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              {/* Package Price */}
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Package Price ($) *</label>
                <input
                  type="number"
                  value={convertForm.packagePrice}
                  onChange={(e) => setConvertForm((f) => ({ ...f, packagePrice: e.target.value }))}
                  placeholder="3500"
                  min="0"
                  className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-brand-main/50 mb-1" style={{ fontSize: "0.75rem" }}>Deposit Amount ($) *</label>
                <input
                  type="number"
                  value={convertForm.depositAmount}
                  onChange={(e) => setConvertForm((f) => ({ ...f, depositAmount: e.target.value }))}
                  placeholder="1000"
                  min="0"
                  className="w-full px-3 py-2.5 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
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
