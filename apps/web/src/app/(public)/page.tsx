"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Star, Heart, Sparkles } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { BrandWaveLoader } from "@/components/shared/brand-wave-loader";
import { useFeaturedTestimonials } from "@/services/testimonials";
import { usePortfolio } from "@/services/portfolio";
import { resolveMediaUrl } from "@/lib/media";
import { useDataSourceStore } from "@/stores/admin-settings-store";
import { EventTypeItem, useEventTypes } from "@/services/event-types";
import { getEventTypeLabel } from "@/lib/event-type-label";

const heroImage =
  "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080";

const featuredWork = [
  {
    title: "Sarah & James",
    category: "Elopement",
    image:
      "https://images.unsplash.com/photo-1764773965414-7a0aa9c2a656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwZm9yZXN0JTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNzIxNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    slug: "sarah-james-elopement",
  },
  {
    title: "Emily & David",
    category: "Wedding",
    image:
      "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    slug: "emily-david-wedding",
  },
  {
    title: "Marco's Surprise",
    category: "Proposal",
    image:
      "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    slug: "marco-surprise-proposal",
  },
];

const services = [
  {
    icon: Heart,
    title: "Weddings & Elopements",
    description:
      "From grand celebrations to intimate mountainside vows, I'll document every tender moment of your love story.",
  },
  {
    icon: Sparkles,
    title: "Proposals & Engagements",
    description:
      "The surprise, the tears, the joy -- let me capture the magic of your next chapter beginning.",
  },
  {
    icon: Star,
    title: "Portraits & Events",
    description:
      "Graduation milestones, professional headshots, and celebrations that deserve to be remembered beautifully.",
  },
];

const testimonials = [
  {
    quote:
      "Mae has the most incredible ability to make you feel completely at ease. Our photos feel like they were pulled straight from a film -- timeless and full of emotion.",
    name: "Sarah & James",
    event: "Forest Elopement, Mt. Hood",
  },
  {
    quote:
      "From the moment we inquired, Mae was communicative, thoughtful, and genuinely invested in our vision. She exceeded every expectation.",
    name: "Emily & David",
    event: "Garden Wedding, Bend OR",
  },
  {
    quote:
      "I still get chills looking at our proposal photos. Mae captured every single detail I would have missed in the moment. Absolutely priceless.",
    name: "Marco & Alicia",
    event: "Sunset Proposal, Cannon Beach",
  },
];

interface PortfolioPhoto {
  url?: string;
  r2Key?: string;
}

interface PortfolioItem {
  slug: string;
  title: string;
  category: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  photos?: PortfolioPhoto[];
  isFeatured?: boolean;
}

interface TestimonialItem {
  id: string;
  clientName: string;
  content: string;
  eventType?: string | null;
  rating?: number | null;
}

interface DisplayTestimonial {
  id: string;
  quote: string;
  name: string;
  event: string;
  rating: number;
}

export default function HomePage() {
  const { dataSource, hasHydrated } = useDataSourceStore();
  const { data: apiTestimonials, isLoading: testimonialsLoading } = useFeaturedTestimonials();
  const { data: apiPortfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: eventTypes = [] } = useEventTypes();

  const showInitialLoader =
    !hasHydrated ||
    (dataSource === "api" && (testimonialsLoading || portfolioLoading));

  const eventTypeOptions = eventTypes as EventTypeItem[];

  const displayTestimonials = useMemo<DisplayTestimonial[]>(() => {
    if (dataSource === "mock") {
      return testimonials.map((item, index) => ({
        id: `mock-${index}`,
        quote: item.quote,
        name: item.name,
        event: item.event,
        rating: 5,
      }));
    }

    const liveTestimonials = (apiTestimonials ?? []) as TestimonialItem[];
    return liveTestimonials.map((testimonial) => ({
      id: testimonial.id,
      quote: testimonial.content,
      name: testimonial.clientName,
      event:
        getEventTypeLabel(testimonial.eventType ?? "", eventTypeOptions) ||
        "Win Photography Client",
      rating: testimonial.rating ?? 5,
    }));
  }, [apiTestimonials, dataSource, eventTypeOptions]);

  const displayFeaturedWork = useMemo(() => {
    if (dataSource === "mock") {
      return featuredWork;
    }

    const portfolioItems = (apiPortfolio ?? []) as PortfolioItem[];
    const featuredItems = portfolioItems.filter((item) => item.isFeatured);
    const sourceItems = featuredItems.length > 0 ? featuredItems : portfolioItems;

    return sourceItems.slice(0, 3).map((item) => {
      const firstPhoto = item.photos?.[0];
      return {
        title: item.title,
        category: getEventTypeLabel(item.category, eventTypeOptions) || item.category,
        image: resolveMediaUrl(
          item.coverImageUrl ||
            item.coverImageKey ||
            firstPhoto?.url ||
            firstPhoto?.r2Key ||
            "",
        ),
        slug: item.slug,
      };
    });
  }, [apiPortfolio, dataSource, eventTypeOptions]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Couple at golden hour"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-main/40 via-brand-main/20 to-brand-main/70" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="tracking-[0.3em] uppercase text-brand-tertiary-light mb-6"
            style={{ fontSize: "0.75rem" }}
          >
            San Francisco, CA &middot; Available Worldwide
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-brand-secondary max-w-4xl"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: "1.1" }}
          >
            Timeless Photography for
            <br />
            <span className="italic text-brand-tertiary-light">
              Life's Most Beautiful Moments
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 text-brand-secondary/80 max-w-xl"
            style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
          >
            Weddings, elopements, proposals, and celebrations -- captured with artistry, warmth, and a deep reverence for your story.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/portfolio"
              className="px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
              style={{ fontSize: "0.7rem" }}
            >
              View Portfolio
            </Link>
            <Link
              href="/inquire"
              className="px-8 py-3.5 border border-brand-secondary/50 text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-secondary/10"
              style={{ fontSize: "0.7rem" }}
            >
              Book Your Session
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-[1px] h-12 bg-gradient-to-b from-brand-secondary/0 via-brand-secondary/50 to-brand-secondary/0"
          />
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-24 lg:py-32 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              What I Offer
            </p>
            <h2
              className="font-serif text-brand-main"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              Photography With Purpose
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-brand-warm flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-brand-tertiary" />
                </div>
                <h3
                  className="font-serif text-brand-main mb-3"
                  style={{ fontSize: "1.3rem" }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-brand-main/60"
                  style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
                >
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-24 lg:py-32 bg-brand-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <p
                className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
                style={{ fontSize: "0.7rem" }}
              >
                Featured Work
              </p>
              <h2
                className="font-serif text-brand-main"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                Recent Love Stories
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-brand-tertiary-dark tracking-[0.1em] uppercase transition-colors hover:text-brand-main group"
              style={{ fontSize: "0.7rem" }}
            >
              View All Work
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {displayFeaturedWork.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayFeaturedWork.map((work, i) => (
                <motion.div
                  key={work.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Link
                    href={`/portfolio/${work.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[3/4] overflow-hidden mb-4">
                      <ImageWithFallback
                        src={work.image}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p
                      className="tracking-[0.2em] uppercase text-brand-tertiary mb-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {work.category}
                    </p>
                    <h3
                      className="font-serif text-brand-main group-hover:text-brand-tertiary-dark transition-colors"
                      style={{ fontSize: "1.25rem" }}
                    >
                      {work.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-brand-main/8 bg-brand-secondary/50">
              <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
                Featured stories will appear here once collections are published.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Large Feature Image */}
      <section className="relative h-[60vh] min-h-[400px]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1684244177286-8625c54bce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdldHRpbmclMjByZWFkeSUyMHdlZGRpbmclMjBkZXRhaWx8ZW58MXx8fHwxNzcxNzIxNjEyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Wedding details"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-main/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="font-serif italic text-brand-secondary max-w-3xl"
              style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)", lineHeight: "1.6" }}
            >
              "Every love story is beautiful, but yours is my favorite to tell."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              Kind Words
            </p>
            <h2
              className="font-serif text-brand-main"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              What Clients Are Saying
            </h2>
          </div>
          {displayTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayTestimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-brand-warm/50 p-8 lg:p-10"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({
                      length: Math.max(1, Math.min(5, testimonial.rating || 5)),
                    }).map((_, j) => (
                      <Star
                        key={`${testimonial.id}-star-${j}`}
                        className="w-3.5 h-3.5 text-brand-tertiary fill-brand-tertiary"
                      />
                    ))}
                  </div>
                  <p
                    className="text-brand-main/80 italic mb-6"
                    style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
                  >
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p
                      className="font-serif text-brand-main"
                      style={{ fontSize: "1.05rem" }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-brand-main/50"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {testimonial.event}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-brand-main/8 bg-brand-warm/30">
              <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
                No client testimonials are published yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-brand-main text-brand-secondary text-center">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              Let's Create Together
            </p>
            <h2
              className="font-serif text-brand-secondary mb-6"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              Ready to Tell Your Story?
            </h2>
            <p
              className="text-brand-secondary/70 mb-10 max-w-xl mx-auto"
              style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
            >
              I'd love to hear about your vision. Whether it's an intimate elopement or a grand celebration, every inquiry begins a conversation about what makes your story uniquely yours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/inquire"
                className="px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
                style={{ fontSize: "0.7rem" }}
              >
                Start the Conversation
              </Link>
              <Link
                href="/pricing"
                className="px-10 py-4 border border-brand-secondary/30 text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:border-brand-secondary/60"
                style={{ fontSize: "0.7rem" }}
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {showInitialLoader && (
        <BrandWaveLoader subtitle="Loading featured stories..." />
      )}
    </div>
  );
}
