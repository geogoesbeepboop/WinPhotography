"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Get the redirect URL from search params, or default based on role
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Check user role to decide where to redirect
        const { data: { user } } = await supabase.auth.getUser();
        const userRole = user?.user_metadata?.role;
        router.push(userRole === "admin" ? "/admin" : "/portal");
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-main relative items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(209,139,143,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(209,139,143,0.15) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative z-10 text-center px-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Camera className="w-8 h-8 text-brand-tertiary" />
            <span
              className="font-serif tracking-[0.2em] uppercase text-brand-secondary"
              style={{ fontSize: "1.25rem" }}
            >
              Mae Win
            </span>
          </Link>
          <h2
            className="font-serif text-brand-secondary/90 mb-4"
            style={{ fontSize: "2rem", lineHeight: "1.3" }}
          >
            Welcome Back
          </h2>
          <p
            className="text-brand-secondary/50 max-w-sm mx-auto"
            style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
          >
            Access your galleries, manage bookings, and relive your beautiful
            moments.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <Camera className="w-6 h-6 text-brand-tertiary" />
              <span
                className="font-serif tracking-[0.2em] uppercase text-brand-main"
                style={{ fontSize: "1.125rem" }}
              >
                Mae Win
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1
              className="font-serif text-brand-main mb-2"
              style={{ fontSize: "1.8rem" }}
            >
              Sign In
            </h1>
            <p
              className="text-brand-main/50"
              style={{ fontSize: "0.85rem" }}
            >
              Access your client portal
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
            <div>
              <label
                className="block text-brand-main mb-1.5 tracking-[0.05em]"
                style={{ fontSize: "0.75rem" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-main/15 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors pr-12"
                  style={{ fontSize: "0.9rem" }}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-tertiary"
                />
                <span
                  className="text-brand-main/60"
                  style={{ fontSize: "0.8rem" }}
                >
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
                style={{ fontSize: "0.8rem" }}
              >
                Forgot password?
              </Link>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            className="text-center mt-8 text-brand-main/50"
            style={{ fontSize: "0.8rem" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/inquire"
              className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
            >
              Book a session
            </Link>{" "}
            to get started.
          </p>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="text-brand-main/40 hover:text-brand-main/70 transition-colors"
              style={{ fontSize: "0.75rem" }}
            >
              &larr; Back to website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
