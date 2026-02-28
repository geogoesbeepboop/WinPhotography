"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Calendar, CheckCircle2, Star } from "lucide-react";
import { format } from "date-fns";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { TestimonialItem, useTestimonials } from "@/services/testimonials";
import { getEventTypeLabel } from "@/lib/event-type-label";
import { resolveMediaUrl } from "@/lib/media";

const fallbackByEventType: Record<string, string> = {
  wedding: "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  engagement: "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  proposal: "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  portrait: "https://images.unsplash.com/photo-1641335339082-f59be37f758d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  event: "https://images.unsplash.com/photo-1767070806009-152054f6edd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  corporate: "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
};

function testimonialImage(testimonial: TestimonialItem): string {
  if (testimonial.avatarUrl) {
    return resolveMediaUrl(testimonial.avatarUrl);
  }

  const key = (testimonial.eventType || "").toLowerCase();
  for (const [eventType, image] of Object.entries(fallbackByEventType)) {
    if (key.includes(eventType)) {
      return image;
    }
  }

  return "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";
}

function excerpt(content: string, maxLength = 135): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

export default function TestimonialsPage() {
  const { data: testimonials = [] } = useTestimonials();
  const { data: eventTypes = [] } = useEventTypes();

  const testimonialItems = testimonials as TestimonialItem[];
  const eventTypeOptions = eventTypes as EventTypeItem[];

  return (
    <div className="bg-brand-secondary min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="tracking-[0.3em] uppercase text-brand-tertiary mb-4" style={{ fontSize: "0.7rem" }}>
            Testimonials
          </p>
          <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            Stories From Our Clients
          </h1>
          <p className="text-brand-main/55 max-w-2xl mx-auto" style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
            Heartfelt feedback paired with real session stories so you can see the experience behind each event.
          </p>
        </div>

        {testimonialItems.length === 0 ? (
          <div className="text-center py-16 border border-brand-main/8 bg-brand-warm/30">
            <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
              No published testimonials yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialItems.map((testimonial, index) => {
              const eventLabel =
                getEventTypeLabel(testimonial.eventType || "", eventTypeOptions) ||
                testimonial.eventType ||
                "Session";
              const portfolioHref = testimonial.portfolioSlug
                ? `/portfolio/${testimonial.portfolioSlug}`
                : "";
              const bookingDate = testimonial.booking?.eventDate
                ? format(new Date(testimonial.booking.eventDate), "MMMM d, yyyy")
                : testimonial.eventDate
                  ? format(new Date(testimonial.eventDate), "MMMM d, yyyy")
                  : undefined;

              const cardContent = (
                <>
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={testimonialImage(testimonial)}
                      alt={`${testimonial.clientName} testimonial`}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        portfolioHref ? "group-hover:scale-105" : ""
                      }`}
                    />
                  </div>
                  <div className="p-4 flex flex-1 flex-col">
                    <div className="flex items-center gap-1 mb-2.5">
                      {Array.from({ length: Math.max(1, Math.min(5, testimonial.rating ?? 5)) }).map((_, starIndex) => (
                        <Star
                          key={`${testimonial.id}-star-${starIndex}`}
                          className="w-3 h-3 text-brand-tertiary fill-brand-tertiary"
                        />
                      ))}
                    </div>

                    <p className="text-brand-main/80 italic mb-3.5" style={{ fontSize: "0.83rem", lineHeight: "1.65" }}>
                      "{excerpt(testimonial.content)}"
                    </p>

                    <div className="mb-4">
                      <p className="font-serif text-brand-main" style={{ fontSize: "1rem" }}>
                        {testimonial.clientName}
                      </p>
                      <p className="text-brand-main/45" style={{ fontSize: "0.75rem" }}>
                        {eventLabel}
                      </p>
                      {testimonial.booking?.lifecycleStage === "completed" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 mt-2"
                          style={{ fontSize: "0.6rem" }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      {bookingDate && (
                        <p className="text-brand-main/40 inline-flex items-center gap-1.5" style={{ fontSize: "0.72rem" }}>
                          <Calendar className="w-3 h-3" />
                          {bookingDate}
                        </p>
                      )}
                      {portfolioHref ? (
                        <span
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-brand-main/15 text-brand-main/65 ml-auto"
                          style={{ fontSize: "0.68rem" }}
                        >
                          Read Full Story
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
              );

              return (
                <motion.article
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-brand-main/8 overflow-hidden max-w-[24rem] mx-auto w-full flex flex-col h-full"
                >
                  {portfolioHref ? (
                    <Link href={portfolioHref} className="group flex h-full flex-col">
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col">
                      {cardContent}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
