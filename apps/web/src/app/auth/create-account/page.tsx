"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function resolveErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;
  return "Unable to create your account. Please try again.";
}

export default function CreateAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone }));
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      errors.phone = "Phone number is required";
    } else if (phoneDigits.length < 10) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/\d/.test(formData.password)) {
      errors.password = "Password must include at least one number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await apiClient.post("/auth/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ""),
        password: formData.password,
      });

      const query = new URLSearchParams({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
      });

      router.push(`/inquire?${query.toString()}`);
      router.refresh();
    } catch (submitError) {
      setError(resolveErrorMessage(submitError));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex">
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
            Create Your Account
          </h2>
          <p
            className="text-brand-secondary/50 max-w-sm mx-auto"
            style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
          >
            Set up your client portal account first, then complete your inquiry
            with your contact details pre-filled.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
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
              Make Your Account
            </h1>
            <p className="text-brand-main/50" style={{ fontSize: "0.85rem" }}>
              We&apos;ll send you directly to the inquiry form next.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    fieldErrors.firstName ? "border-red-400" : "border-brand-main/15"
                  } text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    fieldErrors.lastName ? "border-red-400" : "border-brand-main/15"
                  } text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                  style={{ fontSize: "0.9rem" }}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-brand-main mb-1.5 tracking-[0.05em]"
                style={{ fontSize: "0.75rem" }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border ${
                  fieldErrors.email ? "border-red-400" : "border-brand-main/15"
                } text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors`}
                style={{ fontSize: "0.9rem" }}
                placeholder="your@email.com"
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-brand-main mb-1.5 tracking-[0.05em]"
                style={{ fontSize: "0.75rem" }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-3 bg-white border ${
                  fieldErrors.phone ? "border-red-400" : "border-brand-main/15"
                } text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-tertiary transition-colors`}
                style={{ fontSize: "0.9rem" }}
                placeholder="(555) 123-4567"
                maxLength={14}
                required
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                  {fieldErrors.phone}
                </p>
              )}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    fieldErrors.password ? "border-red-400" : "border-brand-main/15"
                  } text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors pr-12`}
                  style={{ fontSize: "0.9rem" }}
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-main/40 hover:text-brand-main/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-brand-main mb-1.5 tracking-[0.05em]"
                style={{ fontSize: "0.75rem" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    fieldErrors.confirmPassword ? "border-red-400" : "border-brand-main/15"
                  } text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors pr-12`}
                  style={{ fontSize: "0.9rem" }}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-main/40 hover:text-brand-main/70 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-red-500" style={{ fontSize: "0.75rem" }}>
                  {fieldErrors.confirmPassword}
                </p>
              )}
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p
            className="text-center mt-8 text-brand-main/50"
            style={{ fontSize: "0.8rem" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-brand-tertiary hover:text-brand-tertiary-dark transition-colors"
            >
              Sign in
            </Link>
            .
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
