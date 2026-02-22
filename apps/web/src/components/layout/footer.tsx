import Link from "next/link";
import { Camera, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-main text-brand-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Camera className="w-5 h-5 text-brand-tertiary" />
              <span
                className="font-serif tracking-[0.2em] uppercase text-brand-secondary"
                style={{ fontSize: "1rem" }}
              >
                Mae Win
              </span>
            </Link>
            <p
              className="text-brand-secondary/60 mb-6"
              style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
            >
              Capturing life's most meaningful moments with artistry, intention,
              and heart. Based in the Pacific Northwest, available worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-brand-secondary/50 hover:text-brand-tertiary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-brand-secondary/50 hover:text-brand-tertiary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="tracking-[0.2em] uppercase text-brand-tertiary mb-6"
              style={{ fontSize: "0.7rem" }}
            >
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Portfolio", path: "/portfolio" },
                { label: "About", path: "/about" },
                { label: "Pricing", path: "/pricing" },
                { label: "Blog", path: "/blog" },
                { label: "Inquire", path: "/inquire" },
              ].map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-brand-secondary/60 hover:text-brand-secondary transition-colors"
                  style={{ fontSize: "0.85rem" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="tracking-[0.2em] uppercase text-brand-tertiary mb-6"
              style={{ fontSize: "0.7rem" }}
            >
              Services
            </h4>
            <div className="flex flex-col gap-3">
              {[
                "Weddings",
                "Elopements",
                "Proposals",
                "Engagements",
                "Graduation",
                "Headshots",
                "Events",
              ].map((service) => (
                <span
                  key={service}
                  className="text-brand-secondary/60"
                  style={{ fontSize: "0.85rem" }}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="tracking-[0.2em] uppercase text-brand-tertiary mb-6"
              style={{ fontSize: "0.7rem" }}
            >
              Get in Touch
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-tertiary mt-0.5 shrink-0" />
                <span
                  className="text-brand-secondary/60"
                  style={{ fontSize: "0.85rem" }}
                >
                  San Francisco, CA
                  <br />
                  Available Worldwide
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-tertiary mt-0.5 shrink-0" />
                <a
                  href="mailto:hello@maewinphoto.com"
                  className="text-brand-secondary/60 hover:text-brand-secondary transition-colors"
                  style={{ fontSize: "0.85rem" }}
                >
                  hello@maewinphoto.com
                </a>
              </div>
            </div>
            <Link
              href="/inquire"
              className="inline-block mt-8 px-6 py-3 border border-brand-tertiary text-brand-tertiary tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary hover:text-white"
              style={{ fontSize: "0.65rem" }}
            >
              Book a Session
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-secondary/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-brand-secondary/40"
            style={{ fontSize: "0.75rem" }}
          >
            &copy; 2026 Mae Win Photography. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-brand-secondary/40 hover:text-brand-secondary/60 transition-colors"
              style={{ fontSize: "0.75rem" }}
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-brand-secondary/40 hover:text-brand-secondary/60 transition-colors"
              style={{ fontSize: "0.75rem" }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
