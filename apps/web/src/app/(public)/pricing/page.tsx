"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import {
  PackageItem,
  PricingAddOnItem,
  usePackages,
  usePricingAddOns,
} from "@/services/packages";
import { useDataSourceStore } from "@/stores/admin-settings-store";

type Category = {
  id: string;
  label: string;
  description: string;
  eventTypes?: string[];
  tiers: {
    name: string;
    subtitle: string;
    price: string;
    features: string[];
    popular?: boolean;
    sortOrder?: number;
  }[];
};

const mockCategories: Category[] = [
  {
    id: "elopements",
    label: "Elopements",
    description:
      "Intimate celebrations captured with intention — from mountaintop vows to courthouse moments.",
    tiers: [
      {
        name: "Intimate",
        subtitle: "Simple & sweet",
        price: "$2,200",
        features: [
          "Up to 2 hours of coverage",
          "1 location",
          "Online gallery with 100+ edited images",
          "Print release included",
          "Complimentary planning consultation",
          "Gallery delivered in 2-3 weeks",
        ],
      },
      {
        name: "Adventure",
        subtitle: "For the bold & scenic",
        price: "$4,200",
        popular: true,
        features: [
          "Up to 5 hours of coverage",
          "Multiple locations / hiking elopement",
          "Online gallery with 250+ edited images",
          "Print release included",
          "Elopement planning guide & vendor referrals",
          "Timeline & logistics assistance",
          "Sneak peek within 48 hours",
          "Gallery delivered in 3-4 weeks",
        ],
      },
      {
        name: "All-Day",
        subtitle: "The full elopement experience",
        price: "$6,500",
        features: [
          "Up to 10 hours of coverage",
          "Unlimited locations",
          "Online gallery with 500+ edited images",
          "Print release included",
          "Full elopement planning support",
          "Second shooter included",
          "Complimentary engagement session",
          "Sneak peek within 48 hours",
          "Heirloom album design consultation",
          "Gallery delivered in 4-6 weeks",
        ],
      },
    ],
  },
  {
    id: "proposals",
    label: "Proposals",
    description:
      "Surprise proposals captured candidly so you can relive the moment forever.",
    tiers: [
      {
        name: "The Moment",
        subtitle: "Capture the question",
        price: "$800",
        features: [
          "Up to 30 minutes of coverage",
          "1 location (hidden / candid setup)",
          "Online gallery with 40+ edited images",
          "Print release included",
          "Location scouting assistance",
          "Gallery delivered in 1-2 weeks",
        ],
      },
      {
        name: "The Story",
        subtitle: "Proposal + celebration portraits",
        price: "$1,600",
        popular: true,
        features: [
          "Up to 1.5 hours of coverage",
          "Proposal + post-proposal portrait session",
          "Online gallery with 100+ edited images",
          "Print release included",
          "Location scouting & timing strategy",
          "Coordination with vendors (florists, musicians)",
          "Sneak peek within 24 hours",
          "Gallery delivered in 2 weeks",
        ],
      },
      {
        name: "The Experience",
        subtitle: "Full surprise event coverage",
        price: "$2,800",
        features: [
          "Up to 3 hours of coverage",
          "Proposal + celebration/dinner coverage",
          "Online gallery with 200+ edited images",
          "Print release included",
          "Full surprise event planning assistance",
          "Coordination with all vendors",
          "Second photographer for dual angles",
          "Sneak peek within 24 hours",
          "Gallery delivered in 2-3 weeks",
        ],
      },
    ],
  },
  {
    id: "weddings",
    label: "Weddings",
    description:
      "From getting ready to the last dance — every chapter of your wedding story, told beautifully.",
    tiers: [
      {
        name: "Essentials",
        subtitle: "Core wedding coverage",
        price: "$3,800",
        features: [
          "Up to 6 hours of coverage",
          "Ceremony + reception",
          "Online gallery with 300+ edited images",
          "Print release included",
          "Complimentary consultation",
          "Timeline planning assistance",
          "Gallery delivered in 4-5 weeks",
        ],
      },
      {
        name: "Signature",
        subtitle: "Our most popular collection",
        price: "$5,800",
        popular: true,
        features: [
          "Up to 8 hours of coverage",
          "Getting ready through reception",
          "Online gallery with 500+ edited images",
          "Print release included",
          "Second photographer included",
          "Engagement session included",
          "Wedding day timeline planning",
          "Sneak peek within 48 hours",
          "Gallery delivered in 5-6 weeks",
        ],
      },
      {
        name: "Luxe",
        subtitle: "The complete experience",
        price: "$8,500",
        features: [
          "Up to 12 hours of coverage",
          "Rehearsal dinner + full wedding day",
          "Online gallery with 800+ edited images",
          "Print release included",
          "Second photographer included",
          "Engagement session included",
          "Bridal portrait session",
          "Wedding day timeline planning",
          "Sneak peek within 48 hours",
          "Heirloom album (40 pages) included",
          "Gallery delivered in 6-8 weeks",
        ],
      },
    ],
  },
  {
    id: "graduations",
    label: "Graduations",
    description:
      "Celebrate this milestone with portraits that capture your personality and achievement.",
    tiers: [
      {
        name: "Cap & Gown",
        subtitle: "Classic portrait session",
        price: "$450",
        features: [
          "30-minute session",
          "1 location (campus or outdoor)",
          "Online gallery with 25+ edited images",
          "Print release included",
          "Cap & gown + 1 outfit change",
          "Gallery delivered in 1-2 weeks",
        ],
      },
      {
        name: "Milestone",
        subtitle: "Extended celebration session",
        price: "$750",
        popular: true,
        features: [
          "1-hour session",
          "Up to 2 locations",
          "Online gallery with 50+ edited images",
          "Print release included",
          "Up to 3 outfit changes",
          "Friends & family group photos",
          "Sneak peek within 48 hours",
          "Gallery delivered in 1-2 weeks",
        ],
      },
      {
        name: "Legacy",
        subtitle: "The full grad experience",
        price: "$1,200",
        features: [
          "2-hour session",
          "Multiple locations",
          "Online gallery with 100+ edited images",
          "Print release included",
          "Unlimited outfit changes",
          "Family & friends portraits",
          "Ceremony day candid coverage (2 hrs)",
          "Sneak peek within 24 hours",
          "Gallery delivered in 2 weeks",
        ],
      },
    ],
  },
  {
    id: "headshots",
    label: "Headshots",
    description:
      "Professional portraits for executives, creatives, and personal brands.",
    tiers: [
      {
        name: "Quick Shot",
        subtitle: "One polished look",
        price: "$350",
        features: [
          "20-minute session",
          "Studio or natural light",
          "5 retouched final images",
          "Print & digital release",
          "LinkedIn-optimized crop included",
          "Delivered in 5 business days",
        ],
      },
      {
        name: "Professional",
        subtitle: "Multiple looks & backgrounds",
        price: "$650",
        popular: true,
        features: [
          "45-minute session",
          "Studio + optional outdoor location",
          "15 retouched final images",
          "Print & digital release",
          "Up to 3 outfit/look changes",
          "Multiple background options",
          "LinkedIn, website, and social crops",
          "Delivered in 5 business days",
        ],
      },
      {
        name: "Brand Suite",
        subtitle: "Full personal branding",
        price: "$1,200",
        features: [
          "1.5-hour session",
          "Studio + 1-2 on-location settings",
          "30 retouched final images",
          "Print & digital release",
          "Unlimited outfit/look changes",
          "Lifestyle & environmental portraits",
          "Detail shots (workspace, tools, etc.)",
          "Social media content pack",
          "Team headshot add-on available",
          "Delivered in 1 week",
        ],
      },
    ],
  },
  {
    id: "events",
    label: "Events",
    description:
      "Galas, corporate events, celebrations, and everything in between — documented with style.",
    tiers: [
      {
        name: "Coverage",
        subtitle: "Essential event documentation",
        price: "$1,200",
        features: [
          "Up to 2 hours of coverage",
          "Online gallery with 100+ edited images",
          "Print release for personal use",
          "Complimentary pre-event consultation",
          "Gallery delivered in 2 weeks",
        ],
      },
      {
        name: "Full Event",
        subtitle: "Comprehensive event photography",
        price: "$2,400",
        popular: true,
        features: [
          "Up to 5 hours of coverage",
          "Online gallery with 250+ edited images",
          "Print & commercial use release",
          "Pre-event consultation & shot list",
          "Detail & decor photography",
          "Sneak peek within 48 hours",
          "Gallery delivered in 2-3 weeks",
        ],
      },
      {
        name: "Premier",
        subtitle: "Multi-event & premium coverage",
        price: "$4,500",
        features: [
          "Up to 10 hours of coverage",
          "Online gallery with 500+ edited images",
          "Full commercial use release",
          "Pre-event consultation & shot list",
          "Second photographer included",
          "Same-day sneak peek (5 images)",
          "Expedited gallery (1 week)",
          "Social media highlights reel",
          "Multi-day event option available",
        ],
      },
    ],
  },
];

const mockAddOns: PricingAddOnItem[] = [
  { id: "mock-addon-1", name: "Additional Hour", price: 400, priceSuffix: "/hr", sortOrder: 0 },
  { id: "mock-addon-2", name: "Second Photographer", price: 600, sortOrder: 1 },
  { id: "mock-addon-3", name: "Rush Delivery (1 week)", price: 500, sortOrder: 2 },
  { id: "mock-addon-4", name: "Fine Art Album (30 pages)", price: 1200, sortOrder: 3 },
  { id: "mock-addon-5", name: "Canvas Gallery Wrap (16x24)", price: 350, sortOrder: 4 },
  { id: "mock-addon-6", name: "Print Collection (10 prints)", price: 450, sortOrder: 5 },
];

function buildCategoriesFromApi(apiPackages: PackageItem[]): Category[] {
  const grouped: Record<
    string,
    { description: string; tiers: Category["tiers"]; eventTypes: Set<string> }
  > = {};
  for (const pkg of apiPackages) {
    const label = pkg.categoryLabel || "Other";
    if (!grouped[label]) {
      grouped[label] = {
        description: pkg.categoryDescription || "",
        tiers: [],
        eventTypes: new Set<string>(),
      };
    }
    if (pkg.eventType) {
      grouped[label].eventTypes.add(pkg.eventType);
    }
    grouped[label].tiers.push({
      name: pkg.name,
      subtitle: pkg.subtitle || "",
      price: `$${Number(pkg.price).toLocaleString()}`,
      features: pkg.features || [],
      popular: pkg.isPopular,
      sortOrder: pkg.sortOrder ?? 0,
    });
  }
  return Object.entries(grouped).map(([label, { description, tiers, eventTypes }]) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    description,
    eventTypes: Array.from(eventTypes),
    tiers: [...tiers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  }));
}

function formatPrice(price: number | string, priceSuffix?: string | null): string {
  const numericValue =
    typeof price === "number" ? price : Number.parseFloat(String(price));

  let formatted = "";
  if (Number.isFinite(numericValue)) {
    const hasDecimals = Math.round(numericValue * 100) % 100 !== 0;
    formatted = `$${numericValue.toLocaleString("en-US", {
      maximumFractionDigits: hasDecimals ? 2 : 0,
      minimumFractionDigits: hasDecimals ? 2 : 0,
    })}`;
  } else {
    formatted = String(price);
  }

  return `${formatted}${priceSuffix || ""}`;
}

export default function PricingPage() {
  const { dataSource } = useDataSourceStore();
  const { data: apiPackages = [] } = usePackages();

  const isLive = dataSource === "api";
  const categories = useMemo(
    () =>
      isLive
        ? apiPackages.length > 0
          ? buildCategoriesFromApi(apiPackages)
          : []
        : mockCategories,
    [apiPackages, isLive],
  );

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "elopements");

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.some((category) => category.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [activeCategory, categories]);

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];
  const currentCategoryEventTypes = currentCategory?.eventTypes || [];
  const primaryEventType = currentCategoryEventTypes.length === 1 ? currentCategoryEventTypes[0] : undefined;
  const { data: apiAddOns = [] } = usePricingAddOns(primaryEventType);
  const visibleAddOns = (isLive ? apiAddOns : mockAddOns)
    .filter((addon) => {
      if (!isLive) return true;
      if (!addon.isActive) return false;
      if (!addon.eventType) return true;
      if (currentCategoryEventTypes.length === 0) return true;
      return currentCategoryEventTypes.includes(addon.eventType);
    })
    .sort((a, b) => {
      const sortA = a.sortOrder ?? 0;
      const sortB = b.sortOrder ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Investment
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-brand-main mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.1" }}
          >
            Photography Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-brand-main/60 max-w-xl mx-auto"
            style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
          >
            Tailored packages for every type of session. Choose your category
            below, then select the tier that fits your vision. Custom collections
            are always available — just ask.
          </motion.p>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="py-24 bg-brand-secondary">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="font-serif text-brand-main/50 mb-3" style={{ fontSize: "1.4rem" }}>Packages Coming Soon</p>
              <p className="text-brand-main/40 mb-8" style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
                We're putting the finishing touches on our photography collections.
                In the meantime, feel free to reach out — we'd love to create a custom package just for you.
              </p>
              <Link
                href="/inquire"
                className="inline-block px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
                style={{ fontSize: "0.7rem" }}
              >
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </section>
      ) : (
      <>
      {/* Category Tabs */}
      <section className="pb-8 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 tracking-[0.15em] uppercase transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-brand-main text-brand-secondary"
                    : "bg-brand-warm text-brand-main/60 hover:text-brand-main hover:bg-brand-cream-dark"
                }`}
                style={{ fontSize: "0.65rem" }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Description */}
      <section className="py-10 bg-brand-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-brand-main/60"
              style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
            >
              {currentCategory.description}
            </motion.p>
          </AnimatePresence>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-10 lg:py-16 bg-brand-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {currentCategory.tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 lg:p-10 flex flex-col ${
                    tier.popular
                      ? "bg-brand-main text-brand-secondary"
                      : "bg-card text-brand-main"
                  }`}
                >
                  {tier.popular && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3
                      className="font-serif mb-1"
                      style={{ fontSize: "1.6rem" }}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={
                        tier.popular
                          ? "text-brand-secondary/60"
                          : "text-brand-main/50"
                      }
                      style={{ fontSize: "0.8rem" }}
                    >
                      {tier.subtitle}
                    </p>
                    <div className="mt-4 mb-2">
                      <span
                        className="font-serif"
                        style={{ fontSize: "2.5rem" }}
                      >
                        {tier.price}
                      </span>
                    </div>
                    <p
                      className={`tracking-[0.1em] uppercase ${
                        tier.popular
                          ? "text-brand-tertiary-light"
                          : "text-brand-tertiary"
                      }`}
                      style={{ fontSize: "0.6rem" }}
                    >
                      30% deposit to book
                    </p>
                  </div>

                  <div className="w-full h-[1px] bg-current opacity-10 mb-8" />

                  <ul className="space-y-3 mb-10 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.popular
                              ? "text-brand-tertiary-light"
                              : "text-brand-tertiary"
                          }`}
                        />
                        <span
                          className={
                            tier.popular
                              ? "text-brand-secondary/80"
                              : "text-brand-main/70"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/inquire?category=${currentCategory.id}&tier=${encodeURIComponent(tier.name)}`}
                    className={`block text-center py-3.5 tracking-[0.15em] uppercase transition-all duration-300 ${
                      tier.popular
                        ? "bg-brand-tertiary text-white hover:bg-brand-tertiary-dark"
                        : "border border-brand-main text-brand-main hover:bg-brand-main hover:text-brand-secondary"
                    }`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    Inquire About {tier.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Deposit Info */}
      <section className="py-16 bg-brand-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2
            className="font-serif text-brand-main mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            How Booking Works
          </h2>
          <p
            className="text-brand-main/60 mb-12"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            Securing your date is simple and stress-free.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Inquire",
                desc: "Fill out the inquiry form and I'll respond within 24 hours to schedule a consultation.",
              },
              {
                step: "02",
                title: "Book",
                desc: "Sign your contract and pay a 30% retainer deposit to secure your date on my calendar.",
              },
              {
                step: "03",
                title: "Celebrate",
                desc: "Final balance is due 14 days before your session. Then we create magic together!",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span
                  className="font-serif text-brand-tertiary block mb-3"
                  style={{ fontSize: "2rem" }}
                >
                  {s.step}
                </span>
                <h4
                  className="font-serif text-brand-main mb-2"
                  style={{ fontSize: "1.15rem" }}
                >
                  {s.title}
                </h4>
                <p
                  className="text-brand-main/60"
                  style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
                >
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-16 lg:py-24 bg-brand-warm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              Enhancements
            </p>
            <h2
              className="font-serif text-brand-main"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Add-Ons & Extras
            </h2>
          </div>
          {visibleAddOns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleAddOns.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-3 p-5 bg-card/60"
                >
                  <div>
                    <p
                      className="text-brand-main"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {addon.name}
                    </p>
                    {addon.description && (
                      <p className="text-brand-main/45 mt-1" style={{ fontSize: "0.75rem" }}>
                        {addon.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-brand-tertiary font-serif shrink-0"
                    style={{ fontSize: "1.05rem" }}
                  >
                    {formatPrice(addon.price, addon.priceSuffix)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-main/50" style={{ fontSize: "0.9rem" }}>
              No add-ons are available for this event type yet.
            </p>
          )}
        </div>
      </section>

      {/* Full Width Image Break */}
      <section className="relative h-[40vh] min-h-[300px]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Couple in mountain landscape"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-main/20" />
      </section>
      </>
      )}

      {/* FAQ */}
      <section className="py-24 bg-brand-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              Questions
            </p>
            <h2
              className="font-serif text-brand-main"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Frequently Asked
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "Do you travel for sessions?",
                a: "Absolutely! I'm based in San Francisco, CA, but I travel throughout the Bay Area regularly and am available worldwide for destination work. Travel fees may apply for locations beyond 50 miles.",
              },
              {
                q: "How far in advance should I book?",
                a: "I recommend booking 6-12 months in advance for weddings and 2-3 months for other sessions. Popular dates (especially summer weekends) fill quickly!",
              },
              {
                q: "What happens if it rains?",
                a: "Some of my most beautiful work has happened in the rain! I always have backup plans, but honestly, a little weather often creates the most dramatic and memorable images.",
              },
              {
                q: "Can I customize a package?",
                a: "Of course. The tiers shown for each category are starting points. I'm happy to create a custom package tailored to exactly what you need. Just mention it in your inquiry!",
              },
              {
                q: "What's your turnaround time?",
                a: "Gallery delivery times vary by collection — typically 1-8 weeks depending on the session type. You'll always receive a sneak peek within 24-72 hours of your session.",
              },
              {
                q: "How does payment work?",
                a: "A 30% deposit is required to secure your date. The remaining balance is due 14 days before your session. I accept all major credit cards and offer payment plans for weddings.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-b border-brand-main/10 pb-6"
              >
                <h4
                  className="font-serif text-brand-main mb-2"
                  style={{ fontSize: "1.1rem" }}
                >
                  {faq.q}
                </h4>
                <p
                  className="text-brand-main/60"
                  style={{ fontSize: "0.9rem", lineHeight: "1.7" }}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-main text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2
            className="font-serif text-brand-secondary mb-6"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Ready to Book?
          </h2>
          <p
            className="text-brand-secondary/70 mb-10"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            Let's start a conversation about your vision. I can't wait to hear
            your story.
          </p>
          <Link
            href="/inquire"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark group"
            style={{ fontSize: "0.7rem" }}
          >
            Start Your Inquiry
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
