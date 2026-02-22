"use client";

import { motion } from "motion/react";

export default function TermsPage() {
  return (
    <div className="bg-brand-secondary">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              Legal
            </p>
            <h1
              className="font-serif text-brand-main mb-12"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: "1.1" }}
            >
              Terms of Service
            </h1>
          </motion.div>
          <div
            className="space-y-8 text-brand-main/70"
            style={{ fontSize: "0.9rem", lineHeight: "1.9" }}
          >
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                1. Booking & Retainer
              </h3>
              <p>
                A signed contract and a non-refundable retainer of 30% of the
                total package price is required to secure your date. The
                retainer is applied toward your total balance. Dates are not
                held without a signed contract and retainer.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                2. Payment
              </h3>
              <p>
                The remaining balance is due 14 days prior to your session or
                event date. Payment can be made via credit card through our
                secure payment portal. Late payments may result in
                rescheduling.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                3. Cancellation
              </h3>
              <p>
                If you need to cancel, written notice is required. The retainer
                is non-refundable. Cancellations made within 30 days of the
                session date will be charged the full session fee. Date changes
                are subject to availability and may incur a rescheduling fee.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                4. Image Delivery
              </h3>
              <p>
                Edited images will be delivered via a private online gallery
                within the timeframe specified in your package. You will
                receive a print release for personal use. Images may not be
                used for commercial purposes without written permission.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                5. Copyright & Usage
              </h3>
              <p>
                All images are copyrighted by Mae Win Photography. You are
                granted a personal use license. The photographer retains the
                right to use images for portfolio, social media, marketing,
                and editorial purposes unless otherwise agreed upon in writing.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                6. Liability
              </h3>
              <p>
                While every precaution is taken, the photographer is not
                liable for circumstances beyond their control, including but
                not limited to equipment failure, weather, or venue
                restrictions. Liability is limited to the total amount paid
                for services.
              </p>
            </div>
            <p className="text-brand-main/40 pt-8" style={{ fontSize: "0.8rem" }}>
              Last updated: February 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
