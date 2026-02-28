"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  Camera,
  LayoutDashboard,
  CalendarCheck,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { path: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/portal/galleries", label: "Galleries", icon: Image },
  { path: "/portal/bookings", label: "Bookings", icon: CalendarCheck },
  { path: "/portal/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { supabaseUser } = useAuthStore();

  const displayName = (supabaseUser?.user_metadata?.full_name as string) || supabaseUser?.email?.split("@")[0] || "Client";
  const initials = getInitials(displayName);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-brand-secondary">
      {/* Top Bar */}
      <header className="bg-brand-main text-brand-secondary sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-brand-main-light rounded transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-tertiary" />
              <span
                className="font-serif tracking-[0.15em] uppercase"
                style={{ fontSize: "0.9rem" }}
              >
                Mae Win
              </span>
            </Link>
            <span
              className="hidden sm:inline text-brand-secondary/30"
              style={{ fontSize: "0.75rem" }}
            >
              |
            </span>
            <span
              className="hidden sm:inline text-brand-secondary/50 tracking-[0.1em] uppercase"
              style={{ fontSize: "0.65rem" }}
            >
              Client Portal
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  isActive(item.path, item.exact)
                    ? "bg-brand-main-light text-brand-secondary"
                    : "text-brand-secondary/50 hover:text-brand-secondary hover:bg-brand-main-light/50"
                }`}
                style={{ fontSize: "0.8rem" }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full bg-brand-tertiary flex items-center justify-center text-white"
                style={{ fontSize: "0.7rem" }}
              >
                {initials}
              </div>
              <span
                className="text-brand-secondary/70"
                style={{ fontSize: "0.8rem" }}
              >
                {displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-brand-secondary/40 hover:text-brand-secondary transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-brand-main border-t border-brand-secondary/10 overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    isActive(item.path, item.exact)
                      ? "bg-brand-main-light text-brand-secondary"
                      : "text-brand-secondary/50 hover:text-brand-secondary hover:bg-brand-main-light/50"
                  }`}
                  style={{ fontSize: "0.85rem" }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
