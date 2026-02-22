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
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ContractModal } from "@/components/portal/contract-modal";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings } from "@/services/portal";

interface ApiPayment {
  amount: number;
  status: string;
}

interface ApiBooking {
  id: string;
  eventType: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
  status: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  contractUrl?: string;
  contractSignedAt?: string;
  payments?: ApiPayment[];
  client?: { id: string; name?: string };
}

type DisplayStatus = "confirmed" | "completed" | "pending" | "in_progress" | "editing" | "delivered" | "cancelled";

const statusConfig: Record<DisplayStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
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
    label: "Pending Deposit",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    icon: CalendarCheck,
  },
  editing: {
    label: "In Editing",
    color: "bg-purple-100 text-purple-700",
    icon: Clock,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function mapApiStatus(status: string): DisplayStatus {
  const mapping: Record<string, DisplayStatus> = {
    pending_deposit: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    editing: "editing",
    delivered: "delivered",
    completed: "completed",
    cancelled: "cancelled",
  };
  return mapping[status] || "pending";
}

interface DisplayBooking {
  id: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: DisplayStatus;
  contract: boolean;
  contractSigned: boolean;
  contractSignedDate?: string;
  contractId: string;
  totalAmount: number;
  paidAmount: number;
  nextPaymentAmount: number;
  nextPaymentDue?: string;
}

const fallbackBookings: DisplayBooking[] = [
  {
    id: "b1",
    type: "Wedding - Signature",
    category: "Weddings",
    date: "March 22, 2026",
    time: "2:00 PM",
    location: "Golden Gate Park, San Francisco",
    status: "confirmed",
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
    status: "completed",
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
    status: "pending",
    contract: false,
    contractSigned: false,
    contractId: "MW-2026-0410",
    totalAmount: 650,
    paidAmount: 0,
    nextPaymentAmount: 195,
    nextPaymentDue: undefined,
  },
];

function mapApiBookings(apiBookings: ApiBooking[]): DisplayBooking[] {
  return apiBookings.map((b) => {
    const paidAmount = (b.payments || [])
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, b.packagePrice - paidAmount);
    const displayStatus = mapApiStatus(b.status);

    return {
      id: b.id,
      type: b.packageName,
      category: b.eventType,
      date: format(new Date(b.eventDate), "MMMM d, yyyy"),
      time: b.eventTime || "",
      location: b.eventLocation || "",
      status: displayStatus,
      contract: !!b.contractUrl,
      contractSigned: !!b.contractSignedAt,
      contractSignedDate: b.contractSignedAt
        ? format(new Date(b.contractSignedAt), "MMM d, yyyy")
        : undefined,
      contractId: b.id.slice(0, 8).toUpperCase(),
      totalAmount: b.packagePrice,
      paidAmount,
      nextPaymentAmount: balance,
      nextPaymentDue: undefined,
    };
  });
}

export default function PortalBookings() {
  const { supabaseUser } = useAuthStore();
  const clientName = (supabaseUser?.user_metadata?.full_name as string) || supabaseUser?.email || "Client";
  const [contractModal, setContractModal] = useState<string | null>(null);

  const { data: apiBookings, isLoading, isError } = useMyBookings();

  const bookings: DisplayBooking[] =
    apiBookings && (apiBookings as ApiBooking[]).length > 0
      ? mapApiBookings(apiBookings as ApiBooking[])
      : isError || !apiBookings
        ? fallbackBookings
        : [];

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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-card border border-brand-main/8 p-12 text-center">
          <AlertCircle className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
          <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
            No bookings yet. Once you book a session, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking, i) => {
            const config = statusConfig[booking.status] || statusConfig.pending;
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
                          {booking.date}{booking.time ? ` at ${booking.time}` : ""}
                        </span>
                        {booking.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Simplified Payment Status */}
                  {booking.status !== "pending" && booking.status !== "cancelled" && (
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
      )}

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
