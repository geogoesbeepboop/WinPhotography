"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center pt-20">
      <div className="max-w-xl mx-auto px-6 text-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p
            className="font-serif text-brand-tertiary mb-4"
            style={{ fontSize: "5rem", lineHeight: "1" }}
          >
            404
          </p>
          <h1
            className="font-serif text-brand-main mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
          >
            Page Not Found
          </h1>
          <p
            className="text-brand-main/60 mb-10"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            It looks like the page you're looking for doesn't exist or has been
            moved. Let's get you back to somewhere beautiful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
              style={{ fontSize: "0.7rem" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/portfolio"
              className="inline-block px-8 py-3.5 border border-brand-main/20 text-brand-main tracking-[0.15em] uppercase transition-all duration-300 hover:border-brand-main/40"
              style={{ fontSize: "0.7rem" }}
            >
              View Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
