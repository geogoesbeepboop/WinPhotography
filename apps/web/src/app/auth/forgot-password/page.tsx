"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Camera, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        // Still show success to prevent email enumeration
        console.error("Password reset error:", error.message);
      }

      setSent(true);
    } catch {
      // Still show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Camera className="w-6 h-6 text-brand-tertiary" />
            <span
              className="font-serif tracking-[0.2em] uppercase text-brand-main"
              style={{ fontSize: "1.125rem" }}
            >
              Mae Win
            </span>
          </Link>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-12 h-12 text-brand-tertiary mx-auto mb-6" />
            <h1
              className="font-serif text-brand-main mb-3"
              style={{ fontSize: "1.6rem" }}
            >
              Check Your Email
            </h1>
            <p
              className="text-brand-main/60 mb-8"
              style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
            >
              We&apos;ve sent a password reset link to{" "}
              <span className="text-brand-main">{email}</span>. Please check
              your inbox and follow the instructions.
            </p>
            <p
              className="text-brand-main/40 mb-8"
              style={{ fontSize: "0.8rem" }}
            >
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors"
              style={{ fontSize: "0.85rem" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1
                className="font-serif text-brand-main mb-2"
                style={{ fontSize: "1.8rem" }}
              >
                Reset Password
              </h1>
              <p
                className="text-brand-main/50"
                style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
              >
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-main/15 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-main text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-main-light disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontSize: "0.7rem" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors"
                style={{ fontSize: "0.85rem" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
