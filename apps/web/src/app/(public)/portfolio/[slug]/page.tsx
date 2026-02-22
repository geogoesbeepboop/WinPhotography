"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

const portfolioData: Record<
  string,
  {
    title: string;
    category: string;
    location: string;
    date: string;
    description: string;
    images: string[];
  }
> = {
  "sarah-james-elopement": {
    title: "Sarah & James",
    category: "Elopement",
    location: "Mt. Hood, Oregon",
    date: "September 2025",
    description:
      "An intimate sunrise elopement on the slopes of Mt. Hood. Sarah and James chose to celebrate their love surrounded by ancient forests and misty mountain peaks. The morning light painted everything in gold, and every moment felt like it was plucked from a dream.",
    images: [
      "https://images.unsplash.com/photo-1764773965414-7a0aa9c2a656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwZm9yZXN0JTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNzIxNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1579035234222-1af9dc733cce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGJyaWRhbCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNjU5NjcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1645198012585-9c44844c64a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmluZ3MlMjBkZXRhaWwlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTY1ODgzOHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  "emily-david-wedding": {
    title: "Emily & David",
    category: "Wedding",
    location: "Bend, Oregon",
    date: "August 2025",
    description:
      "A garden wedding filled with laughter, happy tears, and the most incredible golden hour light. Emily and David's celebration was a testament to the beauty of gathering your closest people in one place to celebrate love.",
    images: [
      "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzE3MjE2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1684244177286-8625c54bce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdldHRpbmclMjByZWFkeSUyMHdlZGRpbmclMjBkZXRhaWx8ZW58MXx8fHwxNzcxNzIxNjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  "marco-surprise-proposal": {
    title: "Marco & Alicia",
    category: "Proposal",
    location: "Cannon Beach, Oregon",
    date: "July 2025",
    description:
      "A sunset proposal at Cannon Beach with the iconic Haystack Rock as the backdrop. Marco planned every detail perfectly, and Alicia's reaction was pure, unfiltered joy. These are the moments I live for.",
    images: [
      "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1769566025603-2e694fb2ff68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBpbnRpbWF0ZSUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
};

// Fallback for slugs not in our data
const defaultData = {
  title: "Gallery",
  category: "Photography",
  location: "Pacific Northwest",
  date: "2025",
  description:
    "A beautiful collection of moments captured with intention and heart.",
  images: [
    "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
  ],
};

export default function PortfolioDetailPage() {
  const { slug } = useParams();
  const data = portfolioData[slug as string || ""] || defaultData;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % data.images.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + data.images.length) % data.images.length
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-brand-secondary">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors mb-8"
            style={{ fontSize: "0.8rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-3"
              style={{ fontSize: "0.7rem" }}
            >
              {data.category} &middot; {data.location}
            </p>
            <h1
              className="font-serif text-brand-main mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.1" }}
            >
              {data.title}
            </h1>
            <p
              className="text-brand-main/50 mb-4"
              style={{ fontSize: "0.85rem" }}
            >
              {data.date}
            </p>
            <p
              className="text-brand-main/70 max-w-2xl"
              style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
            >
              {data.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-12 lg:py-16 bg-brand-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`cursor-pointer overflow-hidden ${
                  i === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                }`}
                onClick={() => openLightbox(i)}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${data.title} - Photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-warm text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2
            className="font-serif text-brand-main mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            Love What You See?
          </h2>
          <p
            className="text-brand-main/60 mb-8"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            I'd love to create something this beautiful for you. Let's chat
            about your vision.
          </p>
          <Link
            href="/inquire"
            className="inline-block px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
            style={{ fontSize: "0.7rem" }}
          >
            Book Your Session
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={data.images[lightboxIndex]}
                alt={`${data.title} - Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </motion.div>
            <p
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
              style={{ fontSize: "0.8rem" }}
            >
              {lightboxIndex + 1} / {data.images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
