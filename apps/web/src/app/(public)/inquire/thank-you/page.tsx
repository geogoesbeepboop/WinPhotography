"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle, Instagram, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center pt-20">
      <div className="max-w-2xl mx-auto px-6 text-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 mx-auto mb-8 rounded-full bg-brand-warm flex items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 text-brand-tertiary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-brand-main mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Thank You!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-brand-main/60 mb-2"
          style={{ fontSize: "1rem", lineHeight: "1.8" }}
        >
          Your inquiry has been received and I'm already excited to learn more
          about your plans!
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-brand-main/60 mb-10"
          style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
        >
          Expect a personal response from me within 24 hours. In the
          meantime, feel free to browse more of my work or follow along on
          Instagram.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark group"
            style={{ fontSize: "0.7rem" }}
          >
            Browse Portfolio
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-brand-main/20 text-brand-main tracking-[0.15em] uppercase transition-all duration-300 hover:border-brand-main/40"
            style={{ fontSize: "0.7rem" }}
          >
            <Instagram className="w-4 h-4" />
            Follow Along
          </a>
        </motion.div>
      </div>
    </div>
  );
}
