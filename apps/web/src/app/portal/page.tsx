"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Image,
  CalendarCheck,
  Clock,
  Download,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings, useMyGalleries } from "@/services/portal";
import {
  BookingLifecycleStage,
  deriveBookingLifecycleStage,
} from "@/lib/booking-lifecycle";

interface ApiGallery {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
  photoCount: number;
  booking?: { id: string };
  createdAt: string;
  coverImage?: string;
}

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
  payments?: ApiPayment[];
  galleries?: Array<{ status?: string }>;
  client?: { id: string };
}


function mapGalleryStatus(status: string): "ready" | "editing" {
  if (status === "published") return "ready";
  return "editing";
}

const statusConfig = {
  ready: {
    label: "Ready to View",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  editing: {
    label: "In Editing",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
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

export default function PortalDashboard() {
  const { supabaseUser } = useAuthStore();
  const firstName = ((supabaseUser?.user_metadata?.full_name as string) || supabaseUser?.email?.split("@")[0] || "there").split(" ")[0];

  const { data: apiGalleries, isLoading: galleriesLoading } = useMyGalleries();
  const { data: apiBookings, isLoading: bookingsLoading } = useMyBookings();

  const isLoading = galleriesLoading || bookingsLoading;

  // Map API galleries to display format
  const galleries = apiGalleries
    ? (apiGalleries as ApiGallery[]).map((g) => ({
        id: g.id,
        title: g.title,
        date: g.publishedAt
          ? format(new Date(g.publishedAt), "MMMM d, yyyy")
          : format(new Date(g.createdAt), "MMMM d, yyyy"),
        coverImage: g.coverImage || "",
        photoCount: g.photoCount || 0,
        status: mapGalleryStatus(g.status),
      }))
    : [];

  // Map API bookings to display format
  const bookings = apiBookings
    ? (apiBookings as ApiBooking[]).map((b) => {
        const paidAmount = (b.payments || [])
          .filter((p) => p.status === "succeeded")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          id: b.id,
          type: b.packageName,
          date: format(new Date(b.eventDate), "MMMM d, yyyy"),
          status: deriveBookingLifecycleStage(b) as keyof typeof statusConfig,
          paidAmount,
          totalAmount: Number(b.packagePrice),
        };
      })
    : [];

  // Compute stats from real data
  const activeGalleries = galleries.length;
  const upcomingSessions = bookings.filter((booking) => booking.status === "upcoming").length;
  const photosAvailable = galleries
    .filter((g) => g.status === "ready")
    .reduce((sum, g) => sum + g.photoCount, 0);
  const paymentDue = bookings.reduce(
    (sum, b) => sum + Math.max(0, b.totalAmount - b.paidAmount),
    0
  );

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="font-serif text-brand-main mb-1"
          style={{ fontSize: "1.8rem" }}
        >
          Welcome back, {firstName}
        </h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
          Here&apos;s an overview of your galleries and bookings.
        </p>
      </motion.div>

      {/* Quick Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 mb-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Active Galleries",
              value: String(activeGalleries),
              icon: Image,
              color: "text-brand-tertiary",
            },
            {
              label: "Upcoming Sessions",
              value: String(upcomingSessions),
              icon: CalendarCheck,
              color: "text-brand-main-light",
            },
            {
              label: "Photos Available",
              value: String(photosAvailable),
              icon: Download,
              color: "text-brand-tertiary",
            },
            {
              label: "Payment Due",
              value: `$${paymentDue.toLocaleString()}`,
              icon: CreditCard,
              color: "text-brand-tertiary-dark",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card p-5 border border-brand-main/8"
            >
              <stat.icon
                className={`w-5 h-5 ${stat.color} mb-3`}
              />
              <p className="font-serif text-brand-main" style={{ fontSize: "1.5rem" }}>
                {stat.value}
              </p>
              <p
                className="text-brand-main/40 tracking-[0.05em]"
                style={{ fontSize: "0.7rem" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Galleries */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
        id="galleries"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-serif text-brand-main"
            style={{ fontSize: "1.3rem" }}
          >
            Your Galleries
          </h2>
          <Link
            href="/portal/galleries"
            className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors inline-flex items-center gap-1"
            style={{ fontSize: "0.8rem" }}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {galleriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
          </div>
        ) : galleries.length === 0 ? (
          <div className="bg-card border border-brand-main/8 p-12 text-center">
            <Image className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
              No galleries yet. They will appear here once your photographer shares them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {galleries.map((gallery) => {
              const config = statusConfig[gallery.status];
              return (
                <Link
                  key={gallery.id}
                  href={`/portal/galleries/${gallery.id}`}
                  className="group bg-card border border-brand-main/8 overflow-hidden hover:border-brand-tertiary/30 transition-colors"
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={gallery.coverImage}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.color}`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-serif text-brand-main mb-1"
                      style={{ fontSize: "1.15rem" }}
                    >
                      {gallery.title}
                    </h3>
                    <p
                      className="text-brand-main/40"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {gallery.date}
                      {gallery.photoCount > 0 &&
                        ` \u00b7 ${gallery.photoCount} photos`}
                    </p>
                    {gallery.status === "ready" && (
                      <p
                        className="mt-3 text-brand-tertiary inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        style={{ fontSize: "0.8rem" }}
                      >
                        View Gallery
                        <ArrowRight className="w-3.5 h-3.5" />
                      </p>
                    )}
                    {gallery.status === "editing" && (
                      <p
                        className="mt-3 text-brand-main/40"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Photos are being edited
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-serif text-brand-main"
            style={{ fontSize: "1.3rem" }}
          >
            Bookings
          </h2>
          <Link
            href="/portal/bookings"
            className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors inline-flex items-center gap-1"
            style={{ fontSize: "0.8rem" }}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-card border border-brand-main/8 p-12 text-center">
            <CalendarCheck className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>
              No bookings yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const config = statusConfig[booking.status];
              const progress =
                booking.totalAmount > 0
                  ? Math.round((booking.paidAmount / booking.totalAmount) * 100)
                  : 0;
              return (
                <Link
                  key={booking.id}
                  href={`/portal/bookings#booking-${booking.id}`}
                  className="block bg-card border border-brand-main/8 p-5 hover:border-brand-tertiary/35 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h4
                        className="font-serif text-brand-main mb-0.5"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {booking.type}
                      </h4>
                      <p
                        className="text-brand-main/40"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {booking.date}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.color}`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-brand-main/50"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Payment Progress
                      </span>
                      <span
                        className="text-brand-main/70"
                        style={{ fontSize: "0.75rem" }}
                      >
                        ${booking.paidAmount.toLocaleString()} / $
                        {booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-brand-main/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-tertiary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
