"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, Filter, MessageSquare, ArrowRight, Mail, Phone } from "lucide-react";
import { mockInquiries, inquiryStatusConfig, type Inquiry } from "@/lib/mock-data/admin-data";

export default function AdminInquiries() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = mockInquiries.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: mockInquiries.length,
    new: mockInquiries.filter((i) => i.status === "new").length,
    responded: mockInquiries.filter((i) => i.status === "responded").length,
    booked: mockInquiries.filter((i) => i.status === "booked").length,
    archived: mockInquiries.filter((i) => i.status === "archived").length,
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Inquiries</h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Manage incoming inquiries and convert them to bookings.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "new", "responded", "booked", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 transition-colors tracking-[0.05em] capitalize ${
                statusFilter === s ? "bg-brand-main text-brand-secondary" : "bg-white border border-brand-main/10 text-brand-main/50 hover:text-brand-main"
              }`}
              style={{ fontSize: "0.7rem" }}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Inquiry List */}
      <div className="space-y-3">
        {filtered.map((inq, i) => {
          const cfg = inquiryStatusConfig[inq.status];
          return (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/admin/inquiries/${inq.id}`}
                className="block bg-card border border-brand-main/8 p-5 hover:border-brand-tertiary/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-brand-main" style={{ fontSize: "1rem" }}>{inq.name}</h3>
                      <span className={`px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-main/60" style={{ fontSize: "0.8rem" }}>{inq.category} · {inq.tier}</p>
                    <p className="text-brand-main/30" style={{ fontSize: "0.7rem" }}>Received {inq.createdAt}</p>
                  </div>
                </div>
                <p className="text-brand-main/50 line-clamp-2" style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>{inq.message}</p>
                {inq.preferredDate && (
                  <p className="text-brand-tertiary mt-2" style={{ fontSize: "0.75rem" }}>Preferred date: {inq.preferredDate}</p>
                )}
              </Link>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No inquiries match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
