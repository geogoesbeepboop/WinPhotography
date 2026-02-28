"use client";

import { useMemo, useState } from "react";
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
  MessageSquareQuote,
  Star,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ContractModal } from "@/components/portal/contract-modal";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings } from "@/services/portal";
import {
  TestimonialItem,
  useMyTestimonials,
  useSubmitMyTestimonial,
  useUpdateMyTestimonial,
} from "@/services/testimonials";
import {
  BookingLifecycleStage,
  deriveBookingLifecycleStage,
} from "@/lib/booking-lifecycle";

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
  lifecycleStage?: BookingLifecycleStage;
  eventTime?: string;
  eventLocation?: string;
  contractUrl?: string | null;
  contractSignedAt?: string;
  payments?: ApiPayment[];
  galleries?: Array<{ status?: string }>;
  client?: { id: string; name?: string };
}

type DisplayStatus = BookingLifecycleStage;

const statusConfig: Record<DisplayStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending_deposit: {
    label: "Pending Deposit",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-100 text-blue-700",
    icon: CalendarCheck,
  },
  pending_full_payment: {
    label: "Pending Full Payment",
    color: "bg-orange-100 text-orange-700",
    icon: CreditCard,
  },
  pending_delivery: {
    label: "Pending Delivery",
    color: "bg-purple-100 text-purple-700",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-600 text-white",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

interface DisplayBooking {
  id: string;
  type: string;
  category: string;
  rawStatus: string;
  date: string;
  time: string;
  location: string;
  status: DisplayStatus;
  contract: boolean;
  contractUrl?: string;
  contractSigned: boolean;
  contractSignedDate?: string;
  contractId: string;
  totalAmount: number;
  paidAmount: number;
  nextPaymentAmount: number;
  nextPaymentDue?: string;
}


function mapApiBookings(apiBookings: ApiBooking[]): DisplayBooking[] {
  return apiBookings.map((b) => {
    const paidAmount = (b.payments || [])
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, b.packagePrice - paidAmount);
    const displayStatus = deriveBookingLifecycleStage(b);

    return {
      id: b.id,
      type: b.packageName,
      category: b.eventType,
      rawStatus: b.status,
      date: format(new Date(b.eventDate), "MMMM d, yyyy"),
      time: b.eventTime || "",
      location: b.eventLocation || "",
      status: displayStatus,
      contract: Boolean(b.contractUrl),
      contractUrl: b.contractUrl || undefined,
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
  const [testimonialModalBookingId, setTestimonialModalBookingId] = useState<string | null>(null);
  const [testimonialSuccess, setTestimonialSuccess] = useState("");
  const [testimonialForm, setTestimonialForm] = useState({
    content: "",
    rating: 5,
  });
  const [testimonialError, setTestimonialError] = useState("");

  const { data: apiBookings, isLoading } = useMyBookings();
  const { data: myTestimonials = [] } = useMyTestimonials();
  const submitTestimonial = useSubmitMyTestimonial();
  const updateMyTestimonial = useUpdateMyTestimonial();

  const bookings: DisplayBooking[] = apiBookings
    ? mapApiBookings(apiBookings as ApiBooking[])
    : [];

  const testimonialsByBooking = useMemo(() => {
    const map = new Map<string, TestimonialItem>();
    for (const testimonial of myTestimonials as TestimonialItem[]) {
      if (testimonial.bookingId) {
        map.set(testimonial.bookingId, testimonial);
      }
    }
    return map;
  }, [myTestimonials]);

  const activeBooking = bookings.find((b) => b.id === contractModal);
  const testimonialBooking = bookings.find((b) => b.id === testimonialModalBookingId);
  const activeTestimonial = testimonialModalBookingId
    ? testimonialsByBooking.get(testimonialModalBookingId)
    : undefined;
  const testimonialPending = submitTestimonial.isPending || updateMyTestimonial.isPending;

  const canLeaveFeedback = (booking: DisplayBooking): boolean =>
    booking.status === "completed";

  const openTestimonialModal = (bookingId: string) => {
    const existing = testimonialsByBooking.get(bookingId);
    setTestimonialError("");
    setTestimonialSuccess("");
    setTestimonialModalBookingId(bookingId);
    setTestimonialForm({
      content: existing?.content || "",
      rating: existing?.rating ?? 5,
    });
  };

  const closeTestimonialModal = () => {
    if (testimonialPending) return;
    setTestimonialModalBookingId(null);
    setTestimonialError("");
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialModalBookingId) return;

    const trimmedContent = testimonialForm.content.trim();
    if (trimmedContent.length < 10) {
      setTestimonialError("Please enter at least 10 characters.");
      return;
    }

    setTestimonialError("");
    try {
      if (activeTestimonial?.id) {
        await updateMyTestimonial.mutateAsync({
          id: activeTestimonial.id,
          content: trimmedContent,
          rating: testimonialForm.rating,
        });
      } else {
        await submitTestimonial.mutateAsync({
          bookingId: testimonialModalBookingId,
          content: trimmedContent,
          rating: testimonialForm.rating,
        });
      }
      setTestimonialSuccess(
        "Thank you for submitting feedback! Hope we are able to be a part of another special event in your future.",
      );
      setTestimonialModalBookingId(null);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message !==
          "undefined"
          ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : "Failed to submit testimonial. Please try again.";

      if (Array.isArray(message)) {
        setTestimonialError(message.join(", "));
      } else {
        setTestimonialError(message || "Failed to submit testimonial. Please try again.");
      }
    }
  };

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

      {testimonialSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 border border-green-200 bg-green-50 px-4 py-3"
        >
          <p className="text-green-700" style={{ fontSize: "0.82rem" }}>
            {testimonialSuccess}
          </p>
        </motion.div>
      )}

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
            const config = statusConfig[booking.status] || statusConfig.pending_deposit;
            const isPaidInFull = booking.paidAmount >= booking.totalAmount;
            const hasBalance = booking.nextPaymentAmount > 0 && !isPaidInFull;

            return (
              <motion.div
                key={booking.id}
                id={`booking-${booking.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-brand-main/8 overflow-hidden scroll-mt-24"
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
                  {booking.status !== "pending_deposit" && booking.status !== "cancelled" && (
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
                    {booking.contractSigned && (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white"
                        style={{ fontSize: "0.62rem" }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Signed{booking.contractSignedDate ? ` · ${booking.contractSignedDate}` : ""}
                      </span>
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
                    {canLeaveFeedback(booking) && (
                      <button
                        onClick={() => openTestimonialModal(booking.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-brand-main/15 text-brand-main/60 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                        style={{ fontSize: "0.7rem" }}
                      >
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        {testimonialsByBooking.get(booking.id) ? "Edit Feedback" : "Leave Feedback"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Pending contract CTA */}
                {booking.status === "pending_deposit" && booking.contract && (
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
                {booking.status === "pending_deposit" && !booking.contract && (
                  <div className="px-6 py-5 bg-amber-50/50 border-t border-brand-main/6">
                    <p className="text-amber-700" style={{ fontSize: "0.82rem" }}>
                      Contract details are not available yet. You will be notified as soon as the contract is ready to review.
                    </p>
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
            contractUrl: activeBooking.contractUrl,
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

      {testimonialBooking && (
        <div
          className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4"
          onClick={closeTestimonialModal}
        >
          <div
            className="w-full max-w-2xl bg-card border border-brand-main/12 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-serif text-brand-main" style={{ fontSize: "1.35rem" }}>
                  Share Your Experience
                </h2>
                <p className="text-brand-main/50 mt-1" style={{ fontSize: "0.82rem" }}>
                  {testimonialBooking.type} · {testimonialBooking.date}
                </p>
              </div>
              <button
                onClick={closeTestimonialModal}
                className="text-brand-main/30 hover:text-brand-main transition-colors"
                disabled={testimonialPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTestimonial} className="space-y-5">
              <div>
                <label className="block text-brand-main/60 mb-2" style={{ fontSize: "0.75rem" }}>
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const selected = value <= testimonialForm.rating;
                    return (
                      <button
                        key={`rating-${value}`}
                        type="button"
                        onClick={() =>
                          setTestimonialForm((prev) => ({
                            ...prev,
                            rating: value,
                          }))
                        }
                        className="p-1"
                        aria-label={`Set rating to ${value}`}
                        disabled={testimonialPending}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            selected
                              ? "text-brand-tertiary fill-brand-tertiary"
                              : "text-brand-main/20"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-brand-main/60 mb-2" style={{ fontSize: "0.75rem" }}>
                  Your Testimonial
                </label>
                <textarea
                  value={testimonialForm.content}
                  onChange={(event) =>
                    setTestimonialForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  rows={7}
                  className="w-full px-4 py-3 border border-brand-main/10 bg-brand-secondary text-brand-main focus:outline-none focus:border-brand-tertiary resize-none"
                  style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
                  placeholder="Tell us about your experience..."
                  disabled={testimonialPending}
                />
              </div>

              {testimonialError && (
                <p className="text-red-600" style={{ fontSize: "0.8rem" }}>
                  {testimonialError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={testimonialPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase disabled:opacity-60"
                  style={{ fontSize: "0.68rem" }}
                >
                  {testimonialPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      {activeTestimonial ? "Update Feedback" : "Submit Feedback"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeTestimonialModal}
                  className="px-5 py-2.5 border border-brand-main/15 text-brand-main/50 hover:text-brand-main hover:border-brand-main/30 transition-colors"
                  style={{ fontSize: "0.72rem" }}
                  disabled={testimonialPending}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
