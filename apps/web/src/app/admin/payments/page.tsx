"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { paymentStatusConfig } from "@/lib/mock-data/admin-data";
import { usePayments } from "@/services/payments";

export default function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: payments, isLoading } = usePayments();

  const allPayments = payments ?? [];

  const filtered = statusFilter === "all" ? allPayments : allPayments.filter((p: any) => p.status === statusFilter);

  const totalPaid = allPayments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const totalPending = allPayments.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const totalOverdue = allPayments.filter((p: any) => p.status === "overdue").reduce((s: number, p: any) => s + (p.amount || 0), 0);

  const stats = [
    { label: "Total Collected", value: `$${totalPaid.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: `$${totalPending.toLocaleString()}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Overdue", value: `$${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const counts = {
    all: allPayments.length,
    paid: allPayments.filter((p: any) => p.status === "paid").length,
    pending: allPayments.filter((p: any) => p.status === "pending").length,
    overdue: allPayments.filter((p: any) => p.status === "overdue").length,
    refunded: allPayments.filter((p: any) => p.status === "refunded").length,
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Payments</h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Track all payments, deposits, and outstanding balances.</p>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-brand-main/8 p-5 animate-pulse">
              <div className="w-9 h-9 bg-brand-main/8 rounded mb-3" />
              <div className="h-6 bg-brand-main/10 rounded w-28 mb-1" />
              <div className="h-3 bg-brand-main/6 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-brand-main/8 p-5">
              <div className={`w-9 h-9 ${stat.bg} rounded flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="font-serif text-brand-main" style={{ fontSize: "1.4rem" }}>{stat.value}</p>
              <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {(["all", "paid", "pending", "overdue", "refunded"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 transition-colors tracking-[0.05em] capitalize ${statusFilter === s ? "bg-brand-main text-brand-secondary" : "bg-white border border-brand-main/10 text-brand-main/50 hover:text-brand-main"}`}
            style={{ fontSize: "0.7rem" }}>
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-brand-main/8 overflow-hidden">
          <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 bg-brand-secondary/50 border-b border-brand-main/6 text-brand-main/40 tracking-[0.05em] uppercase" style={{ fontSize: "0.65rem" }}>
            <span>Client</span>
            <span>Description</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-brand-main/6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-4 px-5 py-4 animate-pulse">
                <div className="h-4 bg-brand-main/10 rounded w-28" />
                <div className="h-4 bg-brand-main/8 rounded w-32" />
                <div className="h-4 bg-brand-main/6 rounded w-24" />
                <div className="h-4 bg-brand-main/8 rounded w-16 sm:ml-auto" />
                <div className="h-4 bg-brand-main/6 rounded w-14 sm:ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment List */}
      {!isLoading && (
        <>
          <div className="bg-white border border-brand-main/8 overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 bg-brand-secondary/50 border-b border-brand-main/6 text-brand-main/40 tracking-[0.05em] uppercase" style={{ fontSize: "0.65rem" }}>
              <span>Client</span>
              <span>Description</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-brand-main/6">
              {filtered.map((pay: any, i: number) => {
                const cfg = paymentStatusConfig[pay.status];
                const clientName = pay.clientName || pay.booking?.client?.fullName || "Unknown";
                const description = pay.label || pay.paymentType || "";
                const dateDisplay = pay.status === "paid"
                  ? (pay.date || pay.paidAt || "")
                  : `Due ${pay.dueDate || ""}`;
                return (
                  <motion.div key={pay.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-4 px-5 py-4 hover:bg-brand-secondary/30 transition-colors items-center">
                    <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{clientName}</p>
                    <p className="text-brand-main/60" style={{ fontSize: "0.8rem" }}>{description}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.8rem" }}>{dateDisplay}</p>
                    <p className="font-serif text-brand-main sm:text-right" style={{ fontSize: "1rem" }}>${(pay.amount || 0).toLocaleString()}</p>
                    <div className="sm:text-right">
                      {cfg && <span className={`inline-flex px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CreditCard className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
              <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No payments match your filter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
