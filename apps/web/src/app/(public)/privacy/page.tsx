"use client";

import { motion } from "motion/react";

export default function PrivacyPage() {
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
              Privacy Policy
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
                Information We Collect
              </h3>
              <p>
                When you submit an inquiry or book a session, we collect
                information such as your name, email address, phone number,
                event details, and any other information you choose to
                provide. We also collect usage data through analytics tools
                to improve our website experience.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                How We Use Your Information
              </h3>
              <p>
                Your personal information is used to respond to inquiries,
                manage bookings, deliver photo galleries, process payments,
                and communicate important updates about your session. We may
                also use your email to send occasional newsletters (with your
                consent).
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                Data Protection
              </h3>
              <p>
                We implement appropriate security measures to protect your
                personal information. Payment processing is handled securely
                through Stripe and we do not store credit card information on
                our servers. Your client gallery is password-protected and
                accessible only to you.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                Third-Party Services
              </h3>
              <p>
                We use third-party services including Stripe for payment
                processing, cloud storage for gallery delivery, and analytics
                tools for website improvement. These services have their own
                privacy policies governing the use of your information.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                Your Rights
              </h3>
              <p>
                You have the right to access, correct, or delete your
                personal information at any time. You may also opt out of
                marketing communications. To exercise these rights, please
                contact us at hello@maewinphoto.com.
              </p>
            </div>
            <div>
              <h3
                className="font-serif text-brand-main mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                Cookies
              </h3>
              <p>
                Our website uses cookies to enhance your browsing experience
                and analyze site traffic. You can control cookie preferences
                through your browser settings. Essential cookies are required
                for the website to function properly.
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
