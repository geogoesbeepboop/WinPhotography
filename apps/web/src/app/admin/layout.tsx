"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  Camera,
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Image,
  FolderOpen,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { DataSourceToggle } from "@/components/admin/data-source-toggle";

const navSections = [
  {
    title: "Overview",
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Business",
    items: [
      { path: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
      { path: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { path: "/admin/payments", label: "Payments", icon: CreditCard },
      { path: "/admin/clients", label: "Clients", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { path: "/admin/galleries", label: "Galleries", icon: Image },
      { path: "/admin/portfolio", label: "Portfolio", icon: FolderOpen },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userRole, isLoading } = useAuthStore();

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Redirect non-admins to portal
  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") {
      router.push("/portal");
    }
  }, [userRole, isLoading, router]);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-brand-main text-brand-secondary fixed inset-y-0 left-0 z-40">
        <div className="px-6 py-5 border-b border-brand-secondary/10">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-tertiary" />
            <span className="font-serif tracking-[0.15em] uppercase" style={{ fontSize: "0.9rem" }}>
              Mae Win
            </span>
          </Link>
          <p className="text-brand-secondary/30 tracking-[0.1em] uppercase mt-1" style={{ fontSize: "0.6rem" }}>
            Admin Dashboard
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="text-brand-secondary/30 tracking-[0.12em] uppercase px-3 mb-2" style={{ fontSize: "0.6rem" }}>
                {section.title}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors mb-0.5 ${
                    isActive(item.path, "exact" in item && !!item.exact)
                      ? "bg-brand-main-light text-brand-secondary"
                      : "text-brand-secondary/40 hover:text-brand-secondary hover:bg-brand-main-light/50"
                  }`}
                  style={{ fontSize: "0.8rem" }}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-brand-secondary/10 space-y-1">
          <DataSourceToggle />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-brand-secondary/40 hover:text-brand-secondary transition-colors rounded"
            style={{ fontSize: "0.8rem" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-brand-main text-brand-secondary h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-tertiary" />
            <span className="font-serif tracking-[0.15em] uppercase" style={{ fontSize: "0.8rem" }}>
              Mae Win
            </span>
          </Link>
        </div>
        <span className="text-brand-secondary/30 tracking-[0.1em] uppercase" style={{ fontSize: "0.55rem" }}>
          Admin
        </span>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[280px] bg-brand-main text-brand-secondary z-50 overflow-y-auto pt-16"
            >
              <nav className="py-4 px-3">
                {navSections.map((section) => (
                  <div key={section.title} className="mb-5">
                    <p className="text-brand-secondary/30 tracking-[0.12em] uppercase px-3 mb-2" style={{ fontSize: "0.6rem" }}>
                      {section.title}
                    </p>
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors mb-0.5 ${
                          isActive(item.path, "exact" in item && !!item.exact)
                            ? "bg-brand-main-light text-brand-secondary"
                            : "text-brand-secondary/40 hover:text-brand-secondary hover:bg-brand-main-light/50"
                        }`}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        {/* Breadcrumb bar */}
        {/* <div className="bg-card border-b border-brand-main/8 px-4 lg:px-8 py-3 flex items-center gap-2 text-brand-main/40" style={{ fontSize: "0.75rem" }}>
          <Link href="/admin" className="hover:text-brand-main transition-colors">Admin</Link>
          {pathname !== "/admin" && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-main/70 capitalize">
                {pathname.split("/").filter(Boolean).slice(1).join(" / ").replace(/-/g, " ")}
              </span>
            </>
          )}
        </div> */}
        <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
