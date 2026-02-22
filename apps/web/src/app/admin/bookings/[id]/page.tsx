"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, MapPin, Mail, Phone, CreditCard, FileText, Send, CheckCircle2, DollarSign, PlusCircle, User } from "lucide-react";
import { mockBookings, bookingStatusConfig, paymentStatusConfig } from "@/lib/mock-data/admin-data";

export default function AdminBookingDetail() {
  const { id } = useParams();
  const booking = mockBookings.find((b) => b.id === id);
  const [status, setStatus] = useState(booking?.status || "pending");
  const [notes, setNotes] = useState(booking?.notes || "");

  if (!booking) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Booking Not Found</h1>
        <Link href="/admin/bookings" className="text-brand-tertiary" style={{ fontSize: "0.85rem" }}>Back to Bookings</Link>
      </div>
    );
  }

  const cfg = bookingStatusConfig[status];
  const progress = Math.round((booking.paidAmount / booking.totalAmount) * 100);

  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-brand-main" style={{ fontSize: "1.8rem" }}>{booking.type}</h1>
              <span className={`px-3 py-1 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>
            </div>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>{booking.clientName} · Created {booking.createdAt}</p>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
            className="px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary" style={{ fontSize: "0.8rem" }}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Session Details */}
            <div className="bg-white border border-brand-main/8 p-6">
              <h2 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.1rem" }}>Session Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                  <Calendar className="w-4 h-4 text-brand-tertiary shrink-0" /> {booking.date}
                </div>
                <div className="flex items-center gap-3 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                  <Clock className="w-4 h-4 text-brand-tertiary shrink-0" /> {booking.time}
                </div>
                <div className="flex items-center gap-3 text-brand-main/70 sm:col-span-2" style={{ fontSize: "0.85rem" }}>
                  <MapPin className="w-4 h-4 text-brand-tertiary shrink-0" /> {booking.location}
                </div>
              </div>
            </div>

            {/* Payment Management */}
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>Payments</h2>
                <div className="text-right">
                  <p className="font-serif text-brand-main" style={{ fontSize: "1.3rem" }}>${booking.totalAmount.toLocaleString()}</p>
                  <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>Total</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-brand-main/50" style={{ fontSize: "0.75rem" }}>Payment Progress</span>
                  <span className="text-brand-main/70" style={{ fontSize: "0.75rem" }}>${booking.paidAmount.toLocaleString()} / ${booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-brand-main/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-brand-tertiary"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {booking.payments.map((pay) => {
                  const payCfg = paymentStatusConfig[pay.status];
                  return (
                    <div key={pay.id} className="flex items-center justify-between p-3 bg-brand-secondary/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-brand-main/30" />
                        <div>
                          <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{pay.label}</p>
                          <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>
                            {pay.status === "paid" ? `Paid ${pay.date}` : `Due ${pay.dueDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="text-brand-main" style={{ fontSize: "0.9rem" }}>${pay.amount.toLocaleString()}</p>
                        <span className={`px-2 py-0.5 ${payCfg.color}`} style={{ fontSize: "0.6rem" }}>{payCfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-tertiary text-white hover:bg-brand-tertiary-dark transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
                  <Send className="w-3.5 h-3.5" /> Send Payment Reminder
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-brand-main/15 text-brand-main/60 hover:text-brand-main transition-colors" style={{ fontSize: "0.7rem" }}>
                  <PlusCircle className="w-3.5 h-3.5" /> Record Manual Payment
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-brand-main/8 p-6">
              <h2 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.1rem" }}>Notes</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none" style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Client</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-main" style={{ fontSize: "0.85rem" }}>
                  <User className="w-4 h-4 text-brand-main/30" /> {booking.clientName}
                </div>
                <a href={`mailto:${booking.clientEmail}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                  <Mail className="w-4 h-4 text-brand-main/30" /> {booking.clientEmail}
                </a>
              </div>
            </div>

            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Contract</p>
              <div className="flex items-center gap-2 mb-3">
                {booking.contractSigned ? (
                  <span className="flex items-center gap-1.5 text-green-600" style={{ fontSize: "0.8rem" }}><CheckCircle2 className="w-4 h-4" /> Signed</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-600" style={{ fontSize: "0.8rem" }}><FileText className="w-4 h-4" /> Not Signed</span>
                )}
              </div>
              {!booking.contractSigned && (
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
                  <Send className="w-3.5 h-3.5" /> Send Contract
                </button>
              )}
            </div>

            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Quick Actions</p>
              <div className="space-y-2">
                <Link href={`/admin/galleries/new?booking=${booking.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors" style={{ fontSize: "0.7rem" }}>
                  Create Gallery
                </Link>
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors" style={{ fontSize: "0.7rem" }}>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
