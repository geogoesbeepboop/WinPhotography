"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  DollarSign,
  MessageSquare,
  CalendarCheck,
  Image,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  MessageSquareQuote,
} from "lucide-react";
import { inquiryStatusConfig, bookingStatusConfig } from "@/lib/mock-data/admin-data";
import { useInquiries } from "@/services/inquiries";
import { useBookings } from "@/services/bookings";
import { usePayments } from "@/services/payments";
import { useGalleries } from "@/services/galleries";
import { useClients } from "@/services/clients";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { useAdminTestimonials } from "@/services/testimonials";
import { deriveBookingLifecycleStage } from "@/lib/booking-lifecycle";

export default function AdminOverview() {
  const { data: inquiriesData, isLoading: inquiriesLoading } = useInquiries();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();
  const { data: galleriesData, isLoading: galleriesLoading } = useGalleries();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: testimonialsData, isLoading: testimonialsLoading } = useAdminTestimonials();
  const { data: eventTypes = [] } = useEventTypes();

  const inquiries = inquiriesData ?? [];
  const bookings = bookingsData ?? [];
  const payments = paymentsData ?? [];
  const galleries = galleriesData ?? [];
  const clients = clientsData ?? [];
  const testimonials = testimonialsData ?? [];
  const eventTypeOptions = eventTypes as EventTypeItem[];
  const bookingStage = (booking: any) => deriveBookingLifecycleStage(booking);

  const isLoading =
    inquiriesLoading ||
    bookingsLoading ||
    paymentsLoading ||
    galleriesLoading ||
    clientsLoading ||
    testimonialsLoading;

  const totalRevenue = payments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + p.amount, 0);
  const pendingPayments = payments.filter((p: any) => p.status === "pending" || p.status === "overdue").reduce((s: number, p: any) => s + p.amount, 0);
  const newInquiries = inquiries.filter((i: any) => i.status === "new").length;
  const activeBookings = bookings.filter((b: any) => {
    const stage = bookingStage(b);
    return stage !== "completed" && stage !== "cancelled";
  }).length;
  const publishedTestimonials = testimonials.filter((t: any) => t.isPublished).length;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Payments", value: `$${pendingPayments.toLocaleString()}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "New Inquiries", value: String(newInquiries), icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Bookings", value: String(activeBookings), icon: CalendarCheck, color: "text-brand-tertiary", bg: "bg-brand-tertiary/10" },
    { label: "Galleries", value: String(galleries.length), icon: Image, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Clients", value: String(clients.length), icon: Users, color: "text-brand-main-light", bg: "bg-brand-main/5" },
    { label: "Live Testimonials", value: String(publishedTestimonials), icon: MessageSquareQuote, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-brand-main/5 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-brand-main/5 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-brand-main/5 rounded animate-pulse" />
          <div className="h-64 bg-brand-main/5 rounded animate-pulse" />
          <div className="h-48 bg-brand-main/5 rounded animate-pulse lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Dashboard</h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Welcome back, Mae. Here's your business at a glance.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="bg-card p-5 border border-brand-main/8"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-serif text-brand-main" style={{ fontSize: "1.4rem" }}>{stat.value}</p>
            <p className="text-brand-main/40 tracking-[0.05em]" style={{ fontSize: "0.7rem" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-card border border-brand-main/8">
            <div className="flex items-center justify-between p-5 border-b border-brand-main/6">
              <h2 className="font-serif text-brand-main" style={{ fontSize: "1.15rem" }}>Recent Inquiries</h2>
              <Link href="/admin/inquiries" className="text-brand-tertiary hover:text-brand-tertiary-dark inline-flex items-center gap-1 transition-colors" style={{ fontSize: "0.75rem" }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-brand-main/6">
              {inquiries.slice(0, 4).map((inq: any) => {
                const cfg = inquiryStatusConfig[inq.status as keyof typeof inquiryStatusConfig];
                return (
                  <Link key={inq.id} href={`/admin/inquiries/${inq.id}`} className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-brand-main truncate" style={{ fontSize: "0.85rem" }}>{inq.name || inq.contactName}</p>
                      <p className="text-brand-main/40 truncate" style={{ fontSize: "0.75rem" }}>
                        {getEventTypeLabel(inq.category || inq.eventType, eventTypeOptions)} · {inq.tier || inq.contactEmail}
                      </p>
                    </div>
                    {cfg && <span className={`shrink-0 ml-3 px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-card border border-brand-main/8">
            <div className="flex items-center justify-between p-5 border-b border-brand-main/6">
              <h2 className="font-serif text-brand-main" style={{ fontSize: "1.15rem" }}>Upcoming Bookings</h2>
              <Link href="/admin/bookings" className="text-brand-tertiary hover:text-brand-tertiary-dark inline-flex items-center gap-1 transition-colors" style={{ fontSize: "0.75rem" }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-brand-main/6">
              {bookings
                .filter((b: any) => {
                  const stage = bookingStage(b);
                  return stage !== "completed" && stage !== "cancelled";
                })
                .map((bk: any) => {
                const stage = bookingStage(bk);
                const cfg = bookingStatusConfig[stage as keyof typeof bookingStatusConfig];
                return (
                  <Link key={bk.id} href={`/admin/bookings/${bk.id}`} className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-brand-main truncate" style={{ fontSize: "0.85rem" }}>
                        {bk.clientName || bk.client?.fullName}
                      </p>
                      <p className="text-brand-main/40 truncate flex items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
                        <Clock className="w-3 h-3" />{bk.date || bk.eventDate} · {getEventTypeLabel(bk.eventType, eventTypeOptions) || bk.type}
                      </p>
                    </div>
                    {cfg && <span className={`shrink-0 ml-3 px-2.5 py-0.5 ${cfg.color}`} style={{ fontSize: "0.6rem" }}>{cfg.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <div className="bg-card border border-brand-main/8">
            <div className="flex items-center justify-between p-5 border-b border-brand-main/6">
              <h2 className="font-serif text-brand-main" style={{ fontSize: "1.15rem" }}>Pending Payments</h2>
              <Link href="/admin/payments" className="text-brand-tertiary hover:text-brand-tertiary-dark inline-flex items-center gap-1 transition-colors" style={{ fontSize: "0.75rem" }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-brand-main/6">
              {payments.filter((p: any) => p.status === "pending").map((pay: any) => (
                <div key={pay.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-brand-main" style={{ fontSize: "0.85rem" }}>{pay.clientName}</p>
                    <p className="text-brand-main/40" style={{ fontSize: "0.75rem" }}>{pay.label || pay.description} · Due {pay.dueDate}</p>
                  </div>
                  <p className="font-serif text-brand-main" style={{ fontSize: "1.05rem" }}>${pay.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
