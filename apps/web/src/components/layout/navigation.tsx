"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Pricing", path: "/pricing" },
  { label: "Blog", path: "/blog" },
  { label: "Inquire", path: "/inquire" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navBg = scrolled || !isHome
    ? "bg-brand-main/95 backdrop-blur-md shadow-lg"
    : "bg-transparent";

  const textColor = scrolled || !isHome
    ? "text-brand-secondary"
    : "text-brand-secondary";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className={`flex items-center gap-2 ${textColor}`}>
              <Camera className="w-6 h-6 text-brand-tertiary" />
              <span className="font-serif tracking-[0.2em] uppercase" style={{ fontSize: '1.125rem' }}>
                Mae Win
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${textColor} relative tracking-[0.15em] uppercase transition-colors duration-300 hover:text-brand-tertiary group`}
                  style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1px] bg-brand-tertiary transition-all duration-300 ${
                      pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="ml-4 px-5 py-2 border border-brand-tertiary text-brand-tertiary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary hover:text-white"
                style={{ fontSize: '0.65rem' }}
              >
                Client Portal
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className={`lg:hidden ${textColor}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-main flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.path}
                    className={`font-serif tracking-[0.2em] uppercase transition-colors duration-300 ${
                      pathname === link.path
                        ? "text-brand-tertiary"
                        : "text-brand-secondary hover:text-brand-tertiary"
                    }`}
                    style={{ fontSize: '1.5rem' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.08 }}
              >
                <Link
                  href="/auth/login"
                  className="mt-4 px-8 py-3 border border-brand-tertiary text-brand-tertiary tracking-[0.2em] uppercase transition-all duration-300 hover:bg-brand-tertiary hover:text-white"
                  style={{ fontSize: '0.8rem' }}
                >
                  Client Portal
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
