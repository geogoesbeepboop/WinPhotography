"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

const blogPosts = [
  {
    slug: "planning-your-pacific-northwest-elopement",
    title: "A Complete Guide to Planning Your Pacific Northwest Elopement",
    excerpt:
      "From permits and seasons to the most breathtaking locations, everything you need to know to plan an unforgettable PNW elopement.",
    image:
      "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "February 10, 2026",
    readTime: "8 min read",
    category: "Elopements",
  },
  {
    slug: "what-to-wear-engagement-session",
    title: "What to Wear to Your Engagement Session: A Styling Guide",
    excerpt:
      "Styling tips, color palette suggestions, and practical advice to help you feel confident and camera-ready for your engagement photos.",
    image:
      "https://images.unsplash.com/photo-1768772918151-2d0100b534b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwY291cGxlJTIwY2l0eSUyMHVyYmFufGVufDF8fHx8MTc3MTcyMTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "January 28, 2026",
    readTime: "5 min read",
    category: "Tips & Advice",
  },
  {
    slug: "golden-hour-photography-tips",
    title: "Why Golden Hour Makes All the Difference in Your Photos",
    excerpt:
      "Discover why photographers are obsessed with golden hour and how to plan your session to take advantage of this magical light.",
    image:
      "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "January 15, 2026",
    readTime: "4 min read",
    category: "Photography",
  },
  {
    slug: "wedding-timeline-guide",
    title: "How to Build the Perfect Wedding Day Timeline",
    excerpt:
      "A photographer's perspective on creating a stress-free timeline that gives you the best possible images and the most enjoyable day.",
    image:
      "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "December 30, 2025",
    readTime: "6 min read",
    category: "Weddings",
  },
];

export default function BlogPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Journal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-brand-main mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.1" }}
          >
            Stories & Guides
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-brand-main/60 max-w-xl mx-auto"
            style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
          >
            Tips, inspiration, and real love stories from behind the lens.
          </motion.p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href={`/blog/${blogPosts[0].slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-[16/10] overflow-hidden"
            >
              <ImageWithFallback
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 bg-brand-warm text-brand-tertiary-dark tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.6rem" }}
                >
                  {blogPosts[0].category}
                </span>
                <span
                  className="text-brand-main/40 flex items-center gap-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Clock className="w-3 h-3" />
                  {blogPosts[0].readTime}
                </span>
              </div>
              <h2
                className="font-serif text-brand-main mb-4 group-hover:text-brand-tertiary-dark transition-colors"
                style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: "1.3" }}
              >
                {blogPosts[0].title}
              </h2>
              <p
                className="text-brand-main/60 mb-4"
                style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
              >
                {blogPosts[0].excerpt}
              </p>
              <span
                className="text-brand-main/40"
                style={{ fontSize: "0.8rem" }}
              >
                {blogPosts[0].date}
              </span>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Post Grid */}
      <section className="py-16 lg:py-24 bg-brand-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] overflow-hidden mb-4">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 bg-brand-secondary text-brand-tertiary-dark tracking-[0.1em] uppercase"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {post.category}
                    </span>
                    <span
                      className="text-brand-main/40 flex items-center gap-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3
                    className="font-serif text-brand-main mb-2 group-hover:text-brand-tertiary-dark transition-colors"
                    style={{ fontSize: "1.15rem", lineHeight: "1.3" }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-brand-main/50 mb-3"
                    style={{ fontSize: "0.85rem", lineHeight: "1.6" }}
                  >
                    {post.excerpt}
                  </p>
                  <span
                    className="text-brand-main/40"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {post.date}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-secondary text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2
            className="font-serif text-brand-main mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            Want to See More?
          </h2>
          <p
            className="text-brand-main/60 mb-8"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            Follow along on Instagram for daily inspiration, behind-the-scenes
            moments, and recent work.
          </p>
          <Link
            href="/inquire"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark group"
            style={{ fontSize: "0.7rem" }}
          >
            Get in Touch
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
