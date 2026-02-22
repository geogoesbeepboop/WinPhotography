"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  XCircle,
  Camera,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <Link href="/" className="inline-flex items-center gap-3 mb-10">
          <Camera className="w-6 h-6 text-brand-tertiary" />
          <span
            className="font-serif tracking-[0.2em] uppercase text-brand-main"
            style={{ fontSize: "1.125rem" }}
          >
            Mae Win
          </span>
        </Link>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-8"
        >
          <XCircle className="w-10 h-10 text-amber-600" />
        </motion.div>

        <h1
          className="font-serif text-brand-main mb-3"
          style={{ fontSize: "2rem" }}
        >
          Payment Cancelled
        </h1>
        <p
          className="text-brand-main/60 mb-10 max-w-sm mx-auto"
          style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
        >
          No worries — your payment was not processed and no charges were made.
          You can try again whenever you&apos;re ready.
        </p>

        {/* Why it might have been cancelled */}
        <div className="bg-card border border-brand-main/8 p-6 mb-8 text-left">
          <p
            className="tracking-[0.15em] uppercase text-brand-main/40 mb-4"
            style={{ fontSize: "0.65rem" }}
          >
            Common Reasons
          </p>
          <ul className="space-y-3">
            {[
              "The payment page was closed before completing checkout",
              "A card was declined — try a different payment method",
              "You chose to cancel and return to review your booking",
              "A session timeout occurred — simply retry the payment",
            ].map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-2 text-brand-main/60"
                style={{ fontSize: "0.85rem" }}
              >
                <span className="text-brand-main/20 mt-0.5">&bull;</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="bg-brand-warm p-6 mb-8 text-left">
          <p
            className="tracking-[0.15em] uppercase text-brand-main/40 mb-3"
            style={{ fontSize: "0.65rem" }}
          >
            What You Can Do
          </p>
          <div className="space-y-3">
            <p
              className="text-brand-main/70"
              style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
            >
              Your booking is still reserved. Head back to your portal to retry
              the payment, or reach out if you need any help.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/portal/bookings"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-main text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-main-light group"
            style={{ fontSize: "0.7rem" }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry Payment
          </Link>
          <Link
            href="/inquire"
            className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors"
            style={{ fontSize: "0.8rem" }}
          >
            <MessageCircle className="w-4 h-4" />
            Contact Me
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-brand-main/30 hover:text-brand-main/60 transition-colors"
            style={{ fontSize: "0.75rem" }}
          >
            &larr; Return to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
