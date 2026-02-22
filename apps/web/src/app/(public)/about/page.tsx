"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Camera, Heart, Mountain, Globe } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

const photographerImage = "/images/AboutMain.jpg";

const detailImage =
  "https://images.unsplash.com/photo-1769566025603-2e694fb2ff68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBpbnRpbWF0ZSUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080";

const values = [
  {
    icon: Heart,
    title: "Connection First",
    description:
      "I believe the best photos happen when you feel genuinely comfortable. My approach starts with getting to know you -- your story, your quirks, what makes you laugh.",
  },
  {
    icon: Camera,
    title: "Artful Documentation",
    description:
      "I blend fine art direction with candid documentary style. The result? Photos that feel both intentional and authentically you.",
  },
  {
    icon: Mountain,
    title: "Adventure Ready",
    description:
      "Mountain tops at sunrise, forest trails at golden hour, city rooftops at dusk -- I'll go wherever your story takes us.",
  },
  {
    icon: Globe,
    title: "Worldwide",
    description:
      "Based in San Francisco, CA, but I travel to wherever love takes me. Destination elopements and weddings are my specialty.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              About Me
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-brand-main mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.1" }}
            >
              Hey, I'm Mae
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-brand-main/60"
              style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
            >
              A storyteller with a camera, a lover of golden light, and someone
              who genuinely tears up at every first look.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-brand-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/4] overflow-hidden"
            >
              <ImageWithFallback
                src={photographerImage}
                alt="Mae Win, photographer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p
                className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
                style={{ fontSize: "0.7rem" }}
              >
                My Story
              </p>
              <h2
                className="font-serif text-brand-main mb-8"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
              >
                More Than Just a Photographer
              </h2>
              <div
                className="space-y-4 text-brand-main/70"
                style={{ fontSize: "0.9rem", lineHeight: "1.9" }}
              >
                <p>
                  Photography found me during a backpacking trip through Europe
                  in 2015. I was sitting in a small caf&eacute; in Lisbon,
                  watching an elderly couple share a quiet moment over coffee,
                  and something clicked -- both in me and on my camera.
                </p>
                <p>
                  Since then, I've dedicated my life to capturing the in-between
                  moments -- the stolen glances, the happy tears, the belly
                  laughs that make your cheeks hurt. The moments that are easy to
                  miss but impossible to forget.
                </p>
                <p>
                  When I'm not behind a camera, you'll find me hiking with my
                  golden retriever, Juniper, exploring local coffee shops, or
                  planning my next adventure. I'm a firm believer that the best
                  photographs happen when you stop performing and start living.
                </p>
                <p>
                  I'd love for you to feel like you're working with a friend on
                  your big day -- someone who knows your love story, cares
                  deeply about your vision, and will move heaven and earth to
                  deliver images that take your breath away.
                </p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/inquire"
                  className="inline-block px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark text-center"
                  style={{ fontSize: "0.7rem" }}
                >
                  Let's Work Together
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-block px-8 py-3.5 border border-brand-main/20 text-brand-main tracking-[0.15em] uppercase transition-all duration-300 hover:border-brand-main/40 text-center"
                  style={{ fontSize: "0.7rem" }}
                >
                  See My Work
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
              style={{ fontSize: "0.7rem" }}
            >
              My Approach
            </p>
            <h2
              className="font-serif text-brand-main"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              What You Can Expect
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-brand-warm flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-brand-tertiary" />
                </div>
                <h3
                  className="font-serif text-brand-main mb-3"
                  style={{ fontSize: "1.15rem" }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-brand-main/60"
                  style={{ fontSize: "0.85rem", lineHeight: "1.7" }}
                >
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Image + Quote */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="aspect-square lg:aspect-auto">
          <ImageWithFallback
            src={detailImage}
            alt="Intimate portrait photography"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-brand-main flex items-center justify-center p-12 lg:p-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md"
          >
            <p
              className="font-serif italic text-brand-secondary mb-8"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", lineHeight: "1.6" }}
            >
              "I don't just take photos. I create a space where you can be
              fully yourselves, and then I capture the magic that unfolds."
            </p>
            <div className="w-12 h-[1px] bg-brand-tertiary mb-4" />
            <p
              className="tracking-[0.2em] uppercase text-brand-tertiary"
              style={{ fontSize: "0.7rem" }}
            >
              Mae Win
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-secondary text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p
            className="tracking-[0.3em] uppercase text-brand-tertiary mb-4"
            style={{ fontSize: "0.7rem" }}
          >
            Let's Connect
          </p>
          <h2
            className="font-serif text-brand-main mb-6"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            I'd Love to Hear From You
          </h2>
          <p
            className="text-brand-main/60 mb-10"
            style={{ fontSize: "0.9rem", lineHeight: "1.8" }}
          >
            Whether you have a specific date in mind or you're just starting to
            dream, reach out. Every great session starts with a conversation.
          </p>
          <Link
            href="/inquire"
            className="inline-block px-10 py-4 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
            style={{ fontSize: "0.7rem" }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
