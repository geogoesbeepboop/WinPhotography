"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Camera, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
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

        {success ? (
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
              Password Updated
            </h1>
            <p
              className="text-brand-main/60 mb-8"
              style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
            >
              Your password has been successfully reset. You&apos;ll be redirected to
              sign in momentarily.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-brand-main text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-main-light"
              style={{ fontSize: "0.7rem" }}
            >
              Sign In Now
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1
                className="font-serif text-brand-main mb-2"
                style={{ fontSize: "1.8rem" }}
              >
                Set New Password
              </h1>
              <p
                className="text-brand-main/50"
                style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
              >
                Choose a strong password for your account.
              </p>
            </div>

            {error && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700"
                style={{ fontSize: "0.85rem" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-brand-main/15 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors pr-12"
                    style={{ fontSize: "0.9rem" }}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-main/40 hover:text-brand-main/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-main/15 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              {password && (
                <div className="space-y-1">
                  {[
                    {
                      label: "At least 8 characters",
                      valid: password.length >= 8,
                    },
                    {
                      label: "Contains a number",
                      valid: /\d/.test(password),
                    },
                    {
                      label: "Passwords match",
                      valid:
                        confirmPassword.length > 0 &&
                        password === confirmPassword,
                    },
                  ].map((rule) => (
                    <p
                      key={rule.label}
                      className={`flex items-center gap-2 ${
                        rule.valid
                          ? "text-green-600"
                          : "text-brand-main/30"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {rule.label}
                    </p>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-main text-brand-secondary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-main-light disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontSize: "0.7rem" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
