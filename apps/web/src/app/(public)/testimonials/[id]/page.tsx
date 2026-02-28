"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Link as LinkIcon, Loader2, Star } from "lucide-react";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { TestimonialItem, useTestimonialById } from "@/services/testimonials";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { resolveMediaUrl } from "@/lib/media";

const fallbackImage = "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500";

function bookingRedirectUrl(bookingId?: string | null): string {
  if (!bookingId) return "/auth/login?redirectTo=%2Fportal%2Fbookings";
  const redirectTo = `/portal/bookings#booking-${bookingId}`;
  return `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export default function TestimonialDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const { data: testimonial, isLoading } = useTestimonialById(id);
  const { data: eventTypes = [] } = useEventTypes();

  const item = testimonial as TestimonialItem | null;
  const eventTypeOptions = eventTypes as EventTypeItem[];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen pt-36 px-6 text-center">
        <h1 className="font-serif text-brand-main mb-3" style={{ fontSize: "2rem" }}>
          Testimonial Not Found
        </h1>
        <Link href="/testimonials" className="text-brand-tertiary hover:text-brand-tertiary-dark" style={{ fontSize: "0.85rem" }}>
          Back to Testimonials
        </Link>
      </div>
    );
  }

  const eventLabel =
    getEventTypeLabel(item.eventType || "", eventTypeOptions) ||
    item.eventType ||
    "Session";
  const bookingDate = item.booking?.eventDate
    ? format(new Date(item.booking.eventDate), "MMMM d, yyyy")
    : item.eventDate
      ? format(new Date(item.eventDate), "MMMM d, yyyy")
      : undefined;
  const image = item.avatarUrl ? resolveMediaUrl(item.avatarUrl) : fallbackImage;

  return (
    <div className="bg-brand-secondary min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <Link
          href="/testimonials"
          className="inline-flex items-center gap-2 text-brand-main/45 hover:text-brand-main transition-colors mb-8"
          style={{ fontSize: "0.8rem" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Testimonials
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-brand-main/8 overflow-hidden"
        >
          <div className="relative h-80 md:h-[26rem] overflow-hidden">
            <ImageWithFallback
              src={image}
              alt={`${item.clientName} testimonial`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-7 md:p-10">
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: Math.max(1, Math.min(5, item.rating ?? 5)) }).map((_, index) => (
                <Star
                  key={`${item.id}-star-${index}`}
                  className="w-4 h-4 text-brand-tertiary fill-brand-tertiary"
                />
              ))}
            </div>

            <h1 className="font-serif text-brand-main mb-2" style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.5rem)" }}>
              {item.clientName}
            </h1>
            <p className="text-brand-main/55 mb-2" style={{ fontSize: "0.9rem" }}>
              {eventLabel}
            </p>
            {bookingDate && (
              <p className="text-brand-main/45 inline-flex items-center gap-1.5 mb-6" style={{ fontSize: "0.8rem" }}>
                <Calendar className="w-4 h-4" />
                {bookingDate}
              </p>
            )}

            <p className="text-brand-main/80 italic mb-8" style={{ fontSize: "1.02rem", lineHeight: "1.95" }}>
              "{item.content}"
            </p>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
