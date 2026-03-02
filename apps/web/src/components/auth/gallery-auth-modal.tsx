"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GalleryAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => Promise<void> | void;
  emailHint?: string | null;
}

type AuthMode = "login" | "create";

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
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return "Authentication failed. Please try again.";
}

export function GalleryAuthModal({
  open,
  onOpenChange,
  onAuthenticated,
  emailHint,
}: GalleryAuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const title = useMemo(
    () => (mode === "login" ? "Sign In to Continue" : "Create Account to Continue"),
    [mode],
  );

  const resetMessages = () => {
    setError("");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!loginForm.email.trim() || !loginForm.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      await onAuthenticated();
      onOpenChange(false);
    } catch (submitError) {
      setError(resolveErrorMessage(submitError));
      setLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!createForm.firstName.trim() || !createForm.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    if (!emailPattern.test(createForm.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneDigits = createForm.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (createForm.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/\d/.test(createForm.password)) {
      setError("Password must include at least one number.");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const email = createForm.email.trim().toLowerCase();
      await apiClient.post("/auth/register", {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email,
        phone: phoneDigits,
        password: createForm.password,
      });

      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: createForm.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      await onAuthenticated();
      onOpenChange(false);
    } catch (submitError) {
      setError(resolveErrorMessage(submitError));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-brand-secondary border border-brand-main/10 p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="font-serif text-brand-main text-2xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-brand-main/55">
              Sign in or create your account to unlock sharing and full-download access.
              {emailHint ? ` Use ${emailHint} to access this gallery.` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetMessages();
              }}
              className={`px-4 py-2 tracking-[0.08em] uppercase text-[0.68rem] transition-colors ${
                mode === "login"
                  ? "bg-brand-main text-brand-secondary"
                  : "border border-brand-main/15 text-brand-main/60 hover:text-brand-main"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("create");
                resetMessages();
              }}
              className={`px-4 py-2 tracking-[0.08em] uppercase text-[0.68rem] transition-colors ${
                mode === "create"
                  ? "bg-brand-main text-brand-secondary"
                  : "border border-brand-main/15 text-brand-main/60 hover:text-brand-main"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-main text-brand-secondary tracking-[0.12em] uppercase text-[0.7rem] hover:bg-brand-main-light transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      phone: formatPhone(event.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-brand-main/75 tracking-[0.05em] uppercase text-[0.7rem]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={createForm.confirmPassword}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white border border-brand-main/12 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-main text-brand-secondary tracking-[0.12em] uppercase text-[0.7rem] hover:bg-brand-main-light transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
