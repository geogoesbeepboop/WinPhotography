"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function PortalSettings() {
  const { supabaseUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1000);
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
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
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
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-all duration-300 disabled:opacity-50 tracking-[0.1em] uppercase mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                {saving ? (
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
            <div className="space-y-4">
              {[
                {
                  label: "Gallery ready notifications",
                  desc: "Email when a new gallery is available to view",
                  checked: true,
                },
                {
                  label: "Payment reminders",
                  desc: "Reminders about upcoming payment due dates",
                  checked: true,
                },
                {
                  label: "Session reminders",
                  desc: "Reminders leading up to your session date",
                  checked: true,
                },
                {
                  label: "Promotional updates",
                  desc: "Occasional updates about mini sessions and specials",
                  checked: false,
                },
              ].map((pref) => (
                <label
                  key={pref.label}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked={pref.checked}
                    className="mt-1 w-4 h-4 accent-brand-tertiary"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
