"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, CalendarCheck, Clock, MapPin, DollarSign, Plus } from "lucide-react";
import { bookingStatusConfig } from "@/lib/mock-data/admin-data";
import { useBookings } from "@/services/bookings";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";

interface BookingListItem {
  id: string;
  status: string;
  clientName?: string;
  client?: { fullName?: string };
  eventType?: string;
  packageName?: string;
  eventDate?: string;
  date?: string;
  time?: string;
  location?: string;
  totalAmount?: number;
  packagePrice?: number;
  paidAmount?: number;
  depositAmount?: number;
}

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: bookings, isLoading } = useBookings();
  const { data: eventTypes = [] } = useEventTypes();

  const allBookings = (bookings ?? []) as BookingListItem[];
  const eventTypeOptions = eventTypes as EventTypeItem[];

  const filtered = allBookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    const name = (b.clientName || b.client?.fullName || "").toLowerCase();
    const displayEventType = getEventTypeLabel(b.eventType, eventTypeOptions).toLowerCase();
    const type = `${displayEventType} ${(b.eventType || "").toLowerCase()} ${(b.packageName || "").toLowerCase()}`;
    if (search && !name.includes(search.toLowerCase()) && !type.includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: allBookings.length,
    pending: allBookings.filter((b) => b.status === "pending").length,
    confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    completed: allBookings.filter((b) => b.status === "completed").length,
    cancelled: allBookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Bookings</h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Manage all client bookings and sessions.</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary tracking-[0.1em] uppercase hover:bg-brand-main/90 transition-colors"
          style={{ fontSize: "0.7rem" }}
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 transition-colors tracking-[0.05em] capitalize ${statusFilter === s ? "bg-brand-main text-brand-secondary" : "bg-white border border-brand-main/10 text-brand-main/50 hover:text-brand-main"}`}
              style={{ fontSize: "0.7rem" }}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-brand-main/8 p-5 animate-pulse">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-brand-main/10 rounded w-40 mb-2" />
                  <div className="h-3 bg-brand-main/8 rounded w-56 mb-2" />
                  <div className="h-3 bg-brand-main/6 rounded w-72" />
                </div>
                <div className="text-right">
                  <div className="h-5 bg-brand-main/10 rounded w-20 mb-1" />
                  <div className="h-3 bg-brand-main/6 rounded w-16 ml-auto" />
                </div>
              </div>
              <div className="w-full h-1.5 bg-brand-main/8 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Booking List */}
      {!isLoading && (
        <div className="space-y-3">
          {filtered.map((bk, i) => {
            const cfg = bookingStatusConfig[bk.status];
            const total = bk.totalAmount ?? bk.packagePrice ?? 0;
            const paid = bk.paidAmount ?? bk.depositAmount ?? 0;
            const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
            const clientName = bk.clientName || bk.client?.fullName || "Unknown";
            const bookingType = getEventTypeLabel(bk.eventType, eventTypeOptions) || bk.packageName || "";
            const bookingDate = bk.date || bk.eventDate || "";
            return (
              <motion.div key={bk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/admin/bookings/${bk.id}`} className="block bg-white border border-brand-main/8 p-5 hover:border-brand-tertiary/30 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-brand-main" style={{ fontSize: "1rem" }}>{clientName}</h3>
                        {cfg && <span className={`px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>}
                      </div>
                      <p className="text-brand-main/60" style={{ fontSize: "0.85rem" }}>{bookingType}</p>
                      <div className="flex flex-wrap items-center gap-3 text-brand-main/40 mt-1" style={{ fontSize: "0.75rem" }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{bookingDate}{bk.time ? ` at ${bk.time}` : ""}</span>
                        {bk.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{bk.location}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>${total.toLocaleString()}</p>
                      <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>${paid.toLocaleString()} paid</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-brand-main/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-brand-tertiary"}`} style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CalendarCheck className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
              <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No bookings match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
