"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Phone, Calendar, Tag, MessageSquare, Send, CalendarPlus, Archive, CheckCircle2 } from "lucide-react";
import { mockInquiries, inquiryStatusConfig } from "@/lib/mock-data/admin-data";

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const inquiry = mockInquiries.find((i) => i.id === id);
  const [status, setStatus] = useState(inquiry?.status || "new");
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");

  if (!inquiry) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Inquiry Not Found</h1>
        <Link href="/admin/inquiries" className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors" style={{ fontSize: "0.85rem" }}>Back to Inquiries</Link>
      </div>
    );
  }

  const cfg = inquiryStatusConfig[status];

  return (
    <div>
      <Link href="/admin/inquiries" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Inquiries
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-brand-main" style={{ fontSize: "1.8rem" }}>{inquiry.name}</h1>
              <span className={`px-3 py-1 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>
            </div>
            <p className="text-brand-main/40" style={{ fontSize: "0.85rem" }}>Received {inquiry.createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary"
              style={{ fontSize: "0.8rem" }}
            >
              <option value="new">New</option>
              <option value="responded">Responded</option>
              <option value="booked">Booked</option>
              <option value="archived">Archived</option>
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
                  onClick={() => { setReply(""); setStatus("responded"); }}
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
                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                  <Mail className="w-4 h-4 text-brand-main/30" /> {inquiry.email}
                </a>
                <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                  <Phone className="w-4 h-4 text-brand-main/30" /> {inquiry.phone}
                </a>
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Session Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                  <Tag className="w-4 h-4 text-brand-main/30" /> {inquiry.category} · {inquiry.tier}
                </div>
                {inquiry.preferredDate && (
                  <div className="flex items-center gap-2 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                    <Calendar className="w-4 h-4 text-brand-main/30" /> Preferred: {inquiry.preferredDate}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/admin/bookings")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-tertiary text-white hover:bg-brand-tertiary-dark transition-colors tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Convert to Booking
                </button>
                <button
                  onClick={() => setStatus("archived")}
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
    </div>
  );
}
