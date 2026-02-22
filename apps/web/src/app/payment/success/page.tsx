"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Camera,
  ArrowRight,
  Receipt,
  Calendar,
} from "lucide-react";

export default function PaymentSuccess() {
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
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1
          className="font-serif text-brand-main mb-3"
          style={{ fontSize: "2rem" }}
        >
          Payment Successful
        </h1>
        <p
          className="text-brand-main/60 mb-10 max-w-sm mx-auto"
          style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
        >
          Thank you for your payment! A confirmation email has been sent with
          your receipt details.
        </p>

        {/* Payment Summary */}
        <div className="bg-card border border-brand-main/8 p-6 mb-8 text-left">
          <p
            className="tracking-[0.15em] uppercase text-brand-main/40 mb-4"
            style={{ fontSize: "0.65rem" }}
          >
            Payment Summary
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-brand-main/60"
                style={{ fontSize: "0.85rem" }}
              >
                Wedding - Signature Collection
              </span>
              <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>
                Deposit
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-brand-main/60"
                style={{ fontSize: "0.85rem" }}
              >
                Amount Paid
              </span>
              <span
                className="font-serif text-brand-main"
                style={{ fontSize: "1.2rem" }}
              >
                $2,040.00
              </span>
            </div>
            <div className="h-[1px] bg-brand-main/8" />
            <div
              className="flex items-center justify-between text-brand-main/40"
              style={{ fontSize: "0.8rem" }}
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Confirmation #MW-2026-0322
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Feb 22, 2026
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-brand-warm p-6 mb-8 text-left">
          <p
            className="tracking-[0.15em] uppercase text-brand-main/40 mb-3"
            style={{ fontSize: "0.65rem" }}
          >
            What&apos;s Next
          </p>
          <ul className="space-y-2">
            {[
              "Check your email for a detailed receipt and contract",
              "Your session date has been reserved on the calendar",
              "I'll be in touch within 48 hours with next steps",
              "Final balance will be due 14 days before your session",
            ].map((step) => (
              <li
                key={step}
                className="flex items-start gap-2 text-brand-main/70"
                style={{ fontSize: "0.85rem" }}
              >
                <CheckCircle2 className="w-4 h-4 text-brand-tertiary shrink-0 mt-0.5" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-main text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-main-light group"
            style={{ fontSize: "0.7rem" }}
          >
            Go to Portal
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="text-brand-main/40 hover:text-brand-main transition-colors"
            style={{ fontSize: "0.8rem" }}
          >
            Return to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
