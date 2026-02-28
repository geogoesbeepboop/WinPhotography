"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, MapPin, Mail, Phone, CreditCard, FileText, Send, CheckCircle2, DollarSign, PlusCircle, User } from "lucide-react";
import { bookingStatusConfig, paymentStatusConfig } from "@/lib/mock-data/admin-data";
import { useBooking, useUpdateBooking } from "@/services/bookings";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { BookingLifecycleStage, deriveBookingLifecycleStage } from "@/lib/booking-lifecycle";

export default function AdminBookingDetail() {
  const { id } = useParams();
  const { data: booking, isLoading } = useBooking(id as string);
  const { data: eventTypes = [] } = useEventTypes();
  const updateBooking = useUpdateBooking();
  const [status, setStatus] = useState<BookingLifecycleStage>("pending_deposit");
  const [notes, setNotes] = useState("");
  const eventTypeOptions = eventTypes as EventTypeItem[];

  useEffect(() => {
    if (booking) {
      setStatus(deriveBookingLifecycleStage(booking));
      setNotes(booking.adminNotes || "");
    }
  }, [booking]);

  const handleStatusChange = (newStatus: BookingLifecycleStage) => {
    setStatus(newStatus);
    updateBooking.mutate({ id: id as string, status: newStatus });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-4 bg-brand-main/10 rounded w-32 mb-6 animate-pulse" />
        <div className="animate-pulse">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="h-7 bg-brand-main/10 rounded w-64 mb-2" />
              <div className="h-4 bg-brand-main/8 rounded w-48" />
            </div>
            <div className="h-9 bg-brand-main/8 rounded w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-brand-main/8 p-6">
                <div className="h-5 bg-brand-main/10 rounded w-36 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-4 bg-brand-main/8 rounded w-32" />
                  <div className="h-4 bg-brand-main/8 rounded w-24" />
                  <div className="h-4 bg-brand-main/8 rounded w-48 sm:col-span-2" />
                </div>
              </div>
              <div className="bg-white border border-brand-main/8 p-6">
                <div className="h-5 bg-brand-main/10 rounded w-28 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-brand-main/6 rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-white border border-brand-main/8 p-5">
                <div className="h-3 bg-brand-main/8 rounded w-16 mb-3" />
                <div className="h-4 bg-brand-main/10 rounded w-32 mb-2" />
                <div className="h-4 bg-brand-main/8 rounded w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-24">
        <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "1.5rem" }}>Booking Not Found</h1>
        <Link href="/admin/bookings" className="text-brand-tertiary" style={{ fontSize: "0.85rem" }}>Back to Bookings</Link>
      </div>
    );
  }

  const cfg = bookingStatusConfig[status];
  const totalAmount = booking.totalAmount ?? booking.packagePrice ?? 0;
  const payments = (booking.payments || []) as Array<{
    id: string;
    label?: string;
    paymentType?: string;
    amount: number | string;
    status: string;
    date?: string;
    paidAt?: string;
    dueDate?: string;
  }>;
  const paidAmount = payments
    .filter((payment) => payment.status === "succeeded" || payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const progress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const clientName = booking.clientName || booking.client?.fullName || "Unknown";
  const clientEmail = booking.clientEmail || booking.client?.email || "";
  const bookingType =
    getEventTypeLabel(booking.eventType, eventTypeOptions) ||
    booking.type ||
    booking.packageName ||
    "";
  const bookingDate = booking.date || booking.eventDate || "";
  const location = booking.location || booking.eventLocation || "";
  const isContractSigned = Boolean(booking.contractSignedAt || booking.contractSigned);

  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-brand-main" style={{ fontSize: "1.8rem" }}>{bookingType}</h1>
              {cfg && <span className={`px-3 py-1 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>}
            </div>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>{clientName} · Created {booking.createdAt}</p>
          </div>
          <select value={status} onChange={(e) => handleStatusChange(e.target.value as BookingLifecycleStage)}
            className="px-3 py-2 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary" style={{ fontSize: "0.8rem" }}>
            <option value="pending_deposit">Pending Deposit</option>
            <option value="upcoming">Upcoming</option>
            <option value="pending_full_payment">Pending Full Payment</option>
            <option value="pending_delivery">Pending Delivery</option>
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
                  <Calendar className="w-4 h-4 text-brand-tertiary shrink-0" /> {bookingDate}
                </div>
                {booking.time && (
                  <div className="flex items-center gap-3 text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                    <Clock className="w-4 h-4 text-brand-tertiary shrink-0" /> {booking.time}
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3 text-brand-main/70 sm:col-span-2" style={{ fontSize: "0.85rem" }}>
                    <MapPin className="w-4 h-4 text-brand-tertiary shrink-0" /> {location}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Management */}
            <div className="bg-white border border-brand-main/8 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.1rem" }}>Payments</h2>
                <div className="text-right">
                  <p className="font-serif text-brand-main" style={{ fontSize: "1.3rem" }}>${totalAmount.toLocaleString()}</p>
                  <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>Total</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-brand-main/50" style={{ fontSize: "0.75rem" }}>Payment Progress</span>
                  <span className="text-brand-main/70" style={{ fontSize: "0.75rem" }}>${paidAmount.toLocaleString()} / ${totalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-brand-main/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-brand-tertiary"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {payments.map((pay: any) => {
                  const payCfg = paymentStatusConfig[pay.status];
                  return (
                    <div key={pay.id} className="flex items-center justify-between p-3 bg-brand-secondary/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-brand-main/30" />
                        <div>
                        <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{pay.label || pay.paymentType || "Payment"}</p>
                        <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>
                            {pay.status === "paid" || pay.status === "succeeded"
                              ? `Paid ${pay.date || pay.paidAt || ""}`
                              : `Due ${pay.dueDate || ""}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="text-brand-main" style={{ fontSize: "0.9rem" }}>${Number(pay.amount || 0).toLocaleString()}</p>
                        {payCfg && <span className={`px-2 py-0.5 ${payCfg.color}`} style={{ fontSize: "0.6rem" }}>{payCfg.label}</span>}
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
                  <User className="w-4 h-4 text-brand-main/30" /> {clientName}
                </div>
                {clientEmail && (
                  <a href={`mailto:${clientEmail}`} className="flex items-center gap-2 text-brand-main/70 hover:text-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}>
                    <Mail className="w-4 h-4 text-brand-main/30" /> {clientEmail}
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white border border-brand-main/8 p-5">
              <p className="tracking-[0.1em] uppercase text-brand-main/40 mb-3" style={{ fontSize: "0.65rem" }}>Contract</p>
                <div className="flex items-center gap-2 mb-3">
                {isContractSigned ? (
                  <span className="flex items-center gap-1.5 text-green-600" style={{ fontSize: "0.8rem" }}><CheckCircle2 className="w-4 h-4" /> Signed</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-600" style={{ fontSize: "0.8rem" }}><FileText className="w-4 h-4" /> Not Signed</span>
                )}
              </div>
              {booking.contractSignedAt && (
                <p className="text-brand-main/50 mb-3" style={{ fontSize: "0.75rem" }}>
                  Signed on {new Date(booking.contractSignedAt).toLocaleDateString()}
                </p>
              )}
              {booking.contractUrl && (
                <a
                  href={booking.contractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-3 inline-flex text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
                  style={{ fontSize: "0.75rem" }}
                >
                  View signed contract
                </a>
              )}
              {!isContractSigned && (
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
