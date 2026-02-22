"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, CalendarCheck, Clock, MapPin, DollarSign } from "lucide-react";
import { mockBookings, bookingStatusConfig } from "@/lib/mock-data/admin-data";

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = mockBookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search && !b.clientName.toLowerCase().includes(search.toLowerCase()) && !b.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: mockBookings.length,
    pending: mockBookings.filter((b) => b.status === "pending").length,
    confirmed: mockBookings.filter((b) => b.status === "confirmed").length,
    completed: mockBookings.filter((b) => b.status === "completed").length,
    cancelled: mockBookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Bookings</h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Manage all client bookings and sessions.</p>
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

      {/* Booking List */}
      <div className="space-y-3">
        {filtered.map((bk, i) => {
          const cfg = bookingStatusConfig[bk.status];
          const progress = Math.round((bk.paidAmount / bk.totalAmount) * 100);
          return (
            <motion.div key={bk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/admin/bookings/${bk.id}`} className="block bg-white border border-brand-main/8 p-5 hover:border-brand-tertiary/30 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-brand-main" style={{ fontSize: "1rem" }}>{bk.clientName}</h3>
                      <span className={`px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>
                    </div>
                    <p className="text-brand-main/60" style={{ fontSize: "0.85rem" }}>{bk.type}</p>
                    <div className="flex flex-wrap items-center gap-3 text-brand-main/40 mt-1" style={{ fontSize: "0.75rem" }}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{bk.date} at {bk.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{bk.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-brand-main" style={{ fontSize: "1.2rem" }}>${bk.totalAmount.toLocaleString()}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>${bk.paidAmount.toLocaleString()} paid</p>
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
    </div>
  );
}
