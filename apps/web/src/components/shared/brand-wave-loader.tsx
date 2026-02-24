"use client";

import { motion } from "motion/react";

interface BrandWaveLoaderProps {
  subtitle?: string;
  variant?: "overlay" | "fullscreen";
}

export function BrandWaveLoader({
  subtitle = "Loading your experience...",
  variant = "overlay",
}: BrandWaveLoaderProps) {
  const letters = "WIN PHOTOGRAPHY".split("");
  const isFullscreen = variant === "fullscreen";

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center ${
        isFullscreen ? "bg-brand-main" : ""
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      {!isFullscreen && (
        <div className="absolute inset-0 bg-brand-main/35 backdrop-blur-md" />
      )}

      <div
        className={`relative text-center ${
          isFullscreen
            ? "px-6"
            : "mx-4 w-[min(42rem,calc(100%-2rem))] rounded-2xl border border-brand-tertiary-light/20 bg-brand-main/90 px-6 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:px-10 sm:py-10"
        }`}
      >
        <div className="flex items-center justify-center">
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0.25, y: 0 }}
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -10, 0] }}
              transition={{
                duration: 1.15,
                repeat: Infinity,
                repeatType: "loop",
                delay: index * 0.06,
                ease: "easeInOut",
              }}
              className="font-serif tracking-[0.18em] text-brand-tertiary-light"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.7rem)" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.78 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mt-4 tracking-[0.12em] uppercase text-brand-tertiary-light/80"
          style={{ fontSize: "0.68rem" }}
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
