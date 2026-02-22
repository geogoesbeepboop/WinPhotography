"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  FileText,
  MapPin,
} from "lucide-react";
import { ContractModal } from "@/components/portal/contract-modal";
import { useAuthStore } from "@/stores/auth-store";

const bookings = [
  {
    id: "b1",
    type: "Wedding - Signature",
    category: "Weddings",
    date: "March 22, 2026",
    time: "2:00 PM",
    location: "Golden Gate Park, San Francisco",
    status: "confirmed" as const,
    contract: true,
    contractSigned: true,
    contractSignedDate: "Nov 10, 2025",
    contractId: "MW-2026-0322",
    totalAmount: 6800,
    paidAmount: 2040,
    nextPaymentAmount: 4760,
    nextPaymentDue: "March 8, 2026",
  },
  {
    id: "b2",
    type: "Engagement - Full Story",
    category: "Proposals",
    date: "January 15, 2026",
    time: "4:30 PM",
    location: "Baker Beach, San Francisco",
    status: "completed" as const,
    contract: true,
    contractSigned: true,
    contractSignedDate: "Nov 25, 2025",
    contractId: "MW-2026-0115",
    totalAmount: 2200,
    paidAmount: 2200,
    nextPaymentAmount: 0,
    nextPaymentDue: undefined,
  },
  {
    id: "b3",
    type: "Headshots - Professional",
    category: "Headshots",
    date: "April 10, 2026",
    time: "10:00 AM",
    location: "Studio, San Francisco",
    status: "pending" as const,
    contract: false,
    contractSigned: false,
    contractId: "MW-2026-0410",
    totalAmount: 650,
    paidAmount: 0,
    nextPaymentAmount: 195,
    nextPaymentDue: undefined,
  },
];

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-brand-main/10 text-brand-main/60",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending Contract",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
};

export default function PortalBookings() {
  const { supabaseUser } = useAuthStore();
  const clientName = (supabaseUser?.user_metadata?.full_name as string) || supabaseUser?.email || "Client";
  const [contractModal, setContractModal] = useState<string | null>(null);

  const activeBooking = bookings.find((b) => b.id === contractModal);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="font-serif text-brand-main mb-1"
          style={{ fontSize: "1.8rem" }}
        >
          Your Bookings
        </h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
          Manage your sessions, contracts, and payments.
        </p>
      </motion.div>

      <div className="space-y-5">
        {bookings.map((booking, i) => {
          const config = statusConfig[booking.status];
          const isPaidInFull = booking.paidAmount >= booking.totalAmount;
          const hasBalance = booking.nextPaymentAmount > 0 && !isPaidInFull;

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-brand-main/8 overflow-hidden"
            >
              {/* Booking Info */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className="font-serif text-brand-main"
                        style={{ fontSize: "1.2rem" }}
                      >
                        {booking.type}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 ${config.color}`}
                        style={{ fontSize: "0.6rem" }}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap items-center gap-4 text-brand-main/40"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {booking.date} at {booking.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {booking.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simplified Payment Status */}
                {booking.status !== "pending" && (
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-brand-main/6">
                    {isPaidInFull ? (
                      <div className="flex items-center gap-2 text-green-600" style={{ fontSize: "0.8rem" }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Paid in full
                      </div>
                    ) : hasBalance ? (
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>Balance remaining</p>
                          <p className="font-serif text-brand-main" style={{ fontSize: "1.15rem" }}>
                            ${booking.nextPaymentAmount.toLocaleString()}
                          </p>
                        </div>
                        {booking.nextPaymentDue && (
                          <div>
                            <p className="text-brand-main/40" style={{ fontSize: "0.7rem" }}>Due by</p>
                            <p className="text-brand-main/70" style={{ fontSize: "0.85rem" }}>
                              {booking.nextPaymentDue}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {booking.contract && (
                    <button
                      onClick={() => setContractModal(booking.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Contract
                    </button>
                  )}
                  {hasBalance && (
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-tertiary text-white hover:bg-brand-tertiary-dark transition-colors tracking-[0.1em] uppercase"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Balance
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pending contract CTA */}
              {booking.status === "pending" && (
                <div className="px-6 py-5 bg-amber-50/50 border-t border-brand-main/6">
                  <p
                    className="text-amber-700 mb-3"
                    style={{ fontSize: "0.85rem" }}
                  >
                    A contract and deposit are required to confirm this booking.
                  </p>
                  <button
                    onClick={() => setContractModal(booking.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Review & Sign Contract
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Contract Modal */}
      {activeBooking && (
        <ContractModal
          open={contractModal !== null}
          onClose={() => setContractModal(null)}
          contract={{
            bookingType: activeBooking.type,
            clientName,
            date: activeBooking.date,
            time: activeBooking.time,
            location: activeBooking.location,
            totalAmount: activeBooking.totalAmount,
            depositAmount: Math.round(activeBooking.totalAmount * 0.3),
            signed: activeBooking.contractSigned,
            signedDate: activeBooking.contractSignedDate,
            contractId: activeBooking.contractId,
          }}
          onSign={
            !activeBooking.contractSigned
              ? () => {
                  alert("In production, this would redirect to contract signing + Stripe deposit payment.");
                  setContractModal(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
