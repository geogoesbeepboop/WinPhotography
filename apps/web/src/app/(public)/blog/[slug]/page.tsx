"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { BrandWaveLoader } from "@/components/shared/brand-wave-loader";
import { useBlogPost } from "@/services/blog";
import { resolveMediaUrl } from "@/lib/media";
import { useDataSourceStore } from "@/stores/admin-settings-store";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { dataSource, hasHydrated } = useDataSourceStore();
  const { data: post, isLoading } = useBlogPost(slug as string || "");
  const showInitialLoader =
    !hasHydrated || (dataSource === "api" && isLoading);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!post && !showInitialLoader) {
    return (
      <div className="bg-brand-secondary pt-32 pb-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "2rem" }}>
            Post Not Found
          </h1>
          <p className="text-brand-main/60 mb-8" style={{ fontSize: "0.9rem" }}>
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
            style={{ fontSize: "0.85rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-secondary">
        {showInitialLoader && <BrandWaveLoader subtitle="Loading story..." />}
      </div>
    );
  }

  const coverImage = resolveMediaUrl(post.coverImageUrl || post.image);
  const date = formatDate(post.publishedAt || post.createdAt);

  return (
    <div className="bg-brand-secondary">
      {/* Hero Image */}
      {coverImage && (
        <section className="pt-20">
          <div className="h-[50vh] min-h-[350px] relative">
            <ImageWithFallback
              src={coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-main/50 to-transparent" />
          </div>
        </section>
      )}

      {/* Content */}
      <section className={`py-16 lg:py-24 ${!coverImage ? "pt-32" : ""}`}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors mb-8"
            style={{ fontSize: "0.8rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-6">
              {post.category && (
                <span
                  className="px-3 py-1 bg-brand-warm text-brand-tertiary-dark tracking-[0.1em] uppercase"
                  style={{ fontSize: "0.6rem" }}
                >
                  {post.category}
                </span>
              )}
              {date && (
                <span
                  className="text-brand-main/40 flex items-center gap-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
              )}
              {post.readTime && (
                <span
                  className="text-brand-main/40 flex items-center gap-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              )}
            </div>

            <h1
              className="font-serif text-brand-main mb-10"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: "1.2",
              }}
            >
              {post.title}
            </h1>

            {/* Render markdown content */}
            <div className="blog-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-serif text-brand-main mb-4 mt-10" style={{ fontSize: "2rem", lineHeight: "1.2" }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif text-brand-main mb-3 mt-8" style={{ fontSize: "1.5rem", lineHeight: "1.3" }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-serif text-brand-main mb-2 mt-6" style={{ fontSize: "1.2rem", lineHeight: "1.4" }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-brand-main/70 mb-6" style={{ fontSize: "0.95rem", lineHeight: "2" }}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-brand-main/70 mb-6 space-y-2" style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-brand-main/70 mb-6 space-y-2" style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-brand-tertiary pl-6 italic text-brand-main/60 my-8">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-brand-tertiary hover:text-brand-tertiary-dark underline transition-colors">
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-brand-main font-medium">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-brand-main/60">{children}</em>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Author */}
          <div className="mt-16 pt-8 border-t border-brand-main/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center">
              <span className="font-serif text-brand-tertiary" style={{ fontSize: "1.1rem" }}>
                MW
              </span>
            </div>
            <div>
              <p className="text-brand-main font-serif" style={{ fontSize: "1rem" }}>
                Mae Win
              </p>
              <p className="text-brand-main/50" style={{ fontSize: "0.8rem" }}>
                San Francisco, CA &middot; Photographer & Storyteller
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-10 bg-brand-warm text-center">
            <h3
              className="font-serif text-brand-main mb-3"
              style={{ fontSize: "1.3rem" }}
            >
              Inspired by What You Read?
            </h3>
            <p
              className="text-brand-main/60 mb-6"
              style={{ fontSize: "0.9rem" }}
            >
              Let's create your own beautiful story together.
            </p>
            <Link
              href="/inquire"
              className="inline-block px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
              style={{ fontSize: "0.7rem" }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {showInitialLoader && <BrandWaveLoader subtitle="Loading story..." />}
    </div>
  );
}
