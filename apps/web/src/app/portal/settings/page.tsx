"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  NotificationPreferences,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/services/user-preferences";

export default function PortalSettings() {
  const { supabaseUser, setSupabaseUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: notificationData } = useNotificationPreferences();
  const updateNotificationPreferences = useUpdateNotificationPreferences();

  const fullName = (supabaseUser?.user_metadata?.full_name as string) || "";
  const nameParts = fullName.split(" ");
  const defaultFirst = nameParts[0] || supabaseUser?.email?.split("@")[0] || "";
  const defaultLast = nameParts.slice(1).join(" ") || "";

  const [profile, setProfile] = useState({
    firstName: defaultFirst,
    lastName: defaultLast,
    email: supabaseUser?.email || "",
    phone: (supabaseUser?.user_metadata?.phone as string) || "",
  });

  useEffect(() => {
    if (supabaseUser) {
      const fn = (supabaseUser.user_metadata?.full_name as string) || "";
      const parts = fn.split(" ");
      setProfile({
        firstName: parts[0] || supabaseUser.email?.split("@")[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: supabaseUser.email || "",
        phone: (supabaseUser.user_metadata?.phone as string) || "",
      });
    }
  }, [supabaseUser]);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      notifyGalleryReady: true,
      notifyPaymentReminders: true,
      notifySessionReminders: true,
      notifyPromotions: false,
    });

  useEffect(() => {
    if (notificationData) {
      setNotificationPreferences(notificationData);
    }
  }, [notificationData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: `${profile.firstName} ${profile.lastName}`.trim(),
          phone: profile.phone,
        },
      });
      if (updateError) throw updateError;

      // Update auth store with refreshed user
      if (data.user) {
        setSupabaseUser(data.user);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setError("New passwords do not match.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    setSavingPassword(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (updateError) throw updateError;

      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password. Please try again.";
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreferences(true);
    setError(null);

    try {
      await updateNotificationPreferences.mutateAsync(notificationPreferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save notification preferences. Please try again.";
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="font-serif text-brand-main mb-1"
          style={{ fontSize: "1.8rem" }}
        >
          Account Settings
        </h1>
        <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
          Manage your profile and security preferences.
        </p>
      </motion.div>

      {/* Success toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 flex items-center gap-2"
          style={{ fontSize: "0.85rem" }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Changes saved successfully.
        </motion.div>
      )}

      {/* Error toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
          style={{ fontSize: "0.85rem" }}
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card border border-brand-main/8 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-brand-tertiary" />
              <h2
                className="font-serif text-brand-main"
                style={{ fontSize: "1.2rem" }}
              >
                Profile Information
              </h2>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-brand-main mb-1.5 tracking-[0.05em]"
                    style={{ fontSize: "0.75rem" }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    style={{ fontSize: "0.9rem" }}
                  />
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
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Mail className="w-3 h-3 inline mr-1.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main/50 focus:outline-none cursor-not-allowed"
                  style={{ fontSize: "0.9rem" }}
                />
                <p className="text-brand-main/30 mt-1" style={{ fontSize: "0.7rem" }}>
                  Email changes require verification. Contact support to update your email.
                </p>
              </div>
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Phone className="w-3 h-3 inline mr-1.5" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 disabled:opacity-50 tracking-[0.1em] uppercase mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </form>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card border border-brand-main/8 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-brand-tertiary" />
              <h2
                className="font-serif text-brand-main"
                style={{ fontSize: "1.2rem" }}
              >
                Change Password
              </h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      current: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-brand-main mb-1.5 tracking-[0.05em]"
                  style={{ fontSize: "0.75rem" }}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors"
                  style={{ fontSize: "0.9rem" }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 disabled:opacity-50 tracking-[0.1em] uppercase mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Update Password
              </button>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-card border border-brand-main/8 p-6 lg:p-8 mt-5">
            <h3
              className="font-serif text-brand-main mb-5"
              style={{ fontSize: "1.1rem" }}
            >
              Notification Preferences
            </h3>
            <form onSubmit={handleSaveNotificationPreferences}>
              <div className="space-y-4">
                {[
                  {
                    key: "notifyGalleryReady" as const,
                    label: "Gallery ready notifications",
                    desc: "Email when a new gallery is available to view",
                  },
                  {
                    key: "notifyPaymentReminders" as const,
                    label: "Payment reminders",
                    desc: "Reminders about upcoming payment due dates",
                  },
                  {
                    key: "notifySessionReminders" as const,
                    label: "Session reminders",
                    desc: "Reminders leading up to your session date",
                  },
                  {
                    key: "notifyPromotions" as const,
                    label: "Promotional updates",
                    desc: "Occasional updates about mini sessions and specials",
                  },
                ].map((pref) => (
                  <label
                    key={pref.label}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={notificationPreferences[pref.key]}
                      onChange={(event) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          [pref.key]: event.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 accent-brand-tertiary"
                      disabled={savingPreferences}
                    />
                    <div>
                      <p
                        className="text-brand-main"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {pref.label}
                      </p>
                      <p
                        className="text-brand-main/40"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {pref.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={savingPreferences}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 disabled:opacity-50 tracking-[0.1em] uppercase mt-5"
                style={{ fontSize: "0.68rem" }}
              >
                {savingPreferences ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Notification Preferences
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
