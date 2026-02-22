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
} from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useAuthStore } from "@/stores/auth-store";

const mockGalleries = [
  {
    id: "g1",
    title: "Engagement Session",
    date: "January 15, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwcmluZyUyMHByb3Bvc2FsJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNjk5MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    photoCount: 142,
    status: "ready" as const,
  },
  {
    id: "g2",
    title: "Wedding Day",
    date: "March 22, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZ29sZGVuJTIwaG91ciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODYzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    photoCount: 0,
    status: "editing" as const,
  },
];

const mockBookings = [
  {
    id: "b1",
    type: "Wedding - Signature",
    date: "March 22, 2026",
    status: "confirmed" as const,
    paidAmount: 2040,
    totalAmount: 6800,
  },
  {
    id: "b2",
    type: "Engagement - Full Story",
    date: "January 15, 2026",
    status: "completed" as const,
    paidAmount: 2200,
    totalAmount: 2200,
  },
];

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
};

export default function PortalDashboard() {
  const { supabaseUser } = useAuthStore();
  const firstName = ((supabaseUser?.user_metadata?.full_name as string) || supabaseUser?.email?.split("@")[0] || "there").split(" ")[0];

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Active Galleries",
            value: "2",
            icon: Image,
            color: "text-brand-tertiary",
          },
          {
            label: "Upcoming Sessions",
            value: "1",
            icon: CalendarCheck,
            color: "text-brand-main-light",
          },
          {
            label: "Photos Available",
            value: "142",
            icon: Download,
            color: "text-brand-tertiary",
          },
          {
            label: "Payment Due",
            value: "$4,760",
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

      {/* Galleries */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-serif text-brand-main"
            style={{ fontSize: "1.3rem" }}
          >
            Your Galleries
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockGalleries.map((gallery) => {
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
                      Estimated delivery: April 20, 2026
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
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
        <div className="space-y-3">
          {mockBookings.map((booking) => {
            const config = statusConfig[booking.status];
            const progress = Math.round(
              (booking.paidAmount / booking.totalAmount) * 100
            );
            return (
              <div
                key={booking.id}
                className="bg-card border border-brand-main/8 p-5"
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
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
