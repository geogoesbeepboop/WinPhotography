"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Mail, Heart, Send, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useEventTypes } from "@/services/event-types";

const howFoundOptions = [
  "Instagram",
  "Google Search",
  "Friend/Family Referral",
  "Wedding Vendor Referral",
  "The Knot / WeddingWire",
  "Blog Feature",
  "Other",
];

export default function InquirePage() {
  const router = useRouter();
  const { data: eventTypes = [] } = useEventTypes();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sessionType: "",
    date: "",
    location: "",
    guestCount: "",
    budget: "",
    howFound: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length > 0 && digits.length < 10) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    if (!formData.sessionType) errors.sessionType = "Please select an event type";

    if (formData.date) {
      const selected = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
      if (selected < today) {
        errors.date = "Date cannot be in the past";
      } else if (selected > fiveYearsFromNow) {
        errors.date = "Date must be within the next 5 years";
      }
    }

    if (!formData.message.trim()) {
      errors.message = "Please tell us about your vision";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Please provide at least 10 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const guestCount = formData.guestCount ? parseInt(formData.guestCount, 10) : undefined;

      await apiClient.post("/inquiries", {
        contactName: `${formData.firstName} ${formData.lastName}`.trim(),
        contactEmail: formData.email,
        contactPhone: formData.phone ? formData.phone.replace(/\D/g, "") : undefined,
        eventType: formData.sessionType,
        eventDate: formData.date || undefined,
        eventLocation: formData.location || undefined,
        guestCount: guestCount && !isNaN(guestCount) ? guestCount : undefined,
        message: formData.message,
        howFoundUs: formData.howFound || undefined,
      });

      router.push("/inquire/thank-you");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again or email us directly.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-brand-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Let's Connect
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-brand-main mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: "1.1" }}
          >
            Tell Me About Your Vision
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-brand-main/60"
            style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
          >
            I'd love to hear all about what you're planning. Fill out the form
            below and I'll be in touch within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-8 bg-brand-warm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Availability",
                desc: "Currently booking for 2026 & 2027",
              },
              {
                icon: Mail,
                title: "Response Time",
                desc: "I'll reply within 24 hours",
              },
              {
                icon: Heart,
                title: "No Obligation",
                desc: "Let's chat before you commit",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-brand-tertiary" />
                </div>
                <div>
                  <p
                    className="text-brand-main"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-brand-main/50"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 lg:py-24 bg-brand-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => { handleChange(e); if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: "" })); }}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.firstName ? "border-red-400" : "border-brand-main/10"} text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                />
                {fieldErrors.firstName && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => { handleChange(e); if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: "" })); }}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.lastName ? "border-red-400" : "border-brand-main/10"} text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                />
                {fieldErrors.lastName && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => { handleChange(e); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" })); }}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.email ? "border-red-400" : "border-brand-main/10"} text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                />
                {fieldErrors.email && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.email}</p>}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.phone ? "border-red-400" : "border-brand-main/10"} text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                />
                {fieldErrors.phone && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="sessionType"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Event Type *
                </label>
                <select
                  id="sessionType"
                  name="sessionType"
                  required
                  value={formData.sessionType}
                  onChange={(e) => { handleChange(e); if (fieldErrors.sessionType) setFieldErrors((prev) => ({ ...prev, sessionType: "" })); }}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.sessionType ? "border-red-400" : "border-brand-main/10"} text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors appearance-none`}
                  style={{ fontSize: "0.9rem" }}
                >
                  <option value="">Select an event type...</option>
                  {eventTypes.map((eventType) => (
                    <option key={eventType.id} value={eventType.slug}>
                      {eventType.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.sessionType && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.sessionType}</p>}
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => { handleChange(e); if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: "" })); }}
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 bg-white border ${fieldErrors.date ? "border-red-400" : "border-brand-main/10"} text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                />
                {fieldErrors.date && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.date}</p>}
              </div>
            </div>

            {/* Location & Guest Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="location"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  Location / Venue
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Mt. Hood, Timberline Lodge"
                  className="w-full px-4 py-3 bg-white border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label
                  htmlFor="howFound"
                  className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                  style={{ fontSize: "0.7rem" }}
                >
                  How Did You Find Me?
                </label>
                <select
                  id="howFound"
                  name="howFound"
                  value={formData.howFound}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors appearance-none"
                  style={{ fontSize: "0.9rem" }}
                >
                  <option value="">Select...</option>
                  {howFoundOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block mb-2 tracking-[0.1em] uppercase text-brand-main/70"
                style={{ fontSize: "0.7rem" }}
              >
                Tell Me More About Your Vision *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => { handleChange(e); if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: "" })); }}
                placeholder="Tell me about your day, your love story, what matters most to you, anything you'd like me to know..."
                className={`w-full px-4 py-3 bg-white border ${fieldErrors.message ? "border-red-400" : "border-brand-main/10"} text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-tertiary transition-colors resize-none font-sans`}
                style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
              />
              {fieldErrors.message && <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>{fieldErrors.message}</p>}
            </div>

            {error && (
              <div
                className="p-4 bg-red-50 border border-red-200 text-red-700"
                style={{ fontSize: "0.85rem" }}
              >
                {error}
              </div>
            )}

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-12 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark group disabled:opacity-50"
                style={{ fontSize: "0.7rem" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Inquiry
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <p
                className="mt-4 text-brand-main/40"
                style={{ fontSize: "0.8rem" }}
              >
                I'll respond within 24 hours
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
