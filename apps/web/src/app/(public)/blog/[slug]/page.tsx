"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

const blogPostData: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    readTime: string;
    image: string;
    content: string[];
  }
> = {
  "planning-your-pacific-northwest-elopement": {
    title: "A Complete Guide to Planning Your Pacific Northwest Elopement",
    category: "Elopements",
    date: "February 10, 2026",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    content: [
      "The Pacific Northwest is one of the most breathtaking places on Earth to say your vows. From the misty peaks of Mt. Hood to the rugged coastline of the Oregon Coast, this region offers an incredible diversity of landscapes that will make your elopement truly unforgettable.",
      "When planning a PNW elopement, timing is everything. The summer months (June through September) offer the most reliable weather, with long golden hours and clear skies. However, some of my most dramatic and beautiful sessions have happened in the shoulder seasons -- late spring's wildflower blooms and early fall's changing foliage create stunning backdrops that summer can't match.",
      "One of the most important things to consider is permits. Many popular locations in Oregon and Washington require permits for photography and ceremonies. National Forest permits are typically straightforward and affordable, while National Park permits can be more involved. I'll help you navigate this process as part of my planning services.",
      "Here are some of my favorite elopement locations in the Pacific Northwest: Mt. Hood's Trillium Lake offers mirror-like reflections at sunrise. The Columbia River Gorge provides dramatic cliff-side vistas. Cannon Beach with its iconic Haystack Rock creates a timeless coastal setting. And for those willing to adventure, the wildflower meadows of Mt. Rainier are simply unmatched.",
      "My biggest piece of advice? Don't try to recreate someone else's elopement. The beauty of eloping is that you get to design a day that is entirely, authentically yours. Whether that means hiking to a summit at dawn, exchanging vows in a forest clearing, or having a picnic on a beach -- the best elopement is the one that feels most like you.",
      "I offer a complete elopement planning guide to all my couples, including vendor recommendations, timeline templates, and location scouting. If you're dreaming of a Pacific Northwest elopement, I'd love to help you bring that vision to life.",
    ],
  },
  "what-to-wear-engagement-session": {
    title: "What to Wear to Your Engagement Session: A Styling Guide",
    category: "Tips & Advice",
    date: "January 28, 2026",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1768772918151-2d0100b534b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwY291cGxlJTIwY2l0eSUyMHVyYmFufGVufDF8fHx8MTc3MTcyMTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    content: [
      "One of the most common questions I receive from couples is 'What should we wear?' It's a great question, and the answer can make a real difference in how your photos turn out and, more importantly, how you feel during the session.",
      "My number one tip: wear something that makes you feel like the best version of yourself. If you're not a dress person, don't force it. If you love bold colors, lean into it. Authenticity always photographs better than any trend.",
      "That said, here are some general guidelines that work beautifully on camera: Choose complementary colors rather than matching outfits. Soft, muted tones photograph particularly well -- think dusty blues, sage greens, warm neutrals, and soft pinks. These create a timeless, editorial feel.",
      "Texture adds depth and visual interest to photographs. Consider fabrics like linen, silk, cashmere, or lace. Avoid busy patterns and logos, as they can be distracting. Small, subtle patterns can work well, but solid colors are always a safe and elegant choice.",
      "Bring a second outfit! Most engagement sessions include an outfit change, which gives your gallery variety and lets you show different sides of your personality. I recommend one more casual/relaxed look and one that's a bit more dressed up.",
      "Finally, coordinate with your location. A flowing dress looks incredible in an open field or on a beach, while a more structured outfit pairs well with urban settings. I'm always happy to help with styling recommendations specific to your session location.",
    ],
  },
  "golden-hour-photography-tips": {
    title: "Why Golden Hour Makes All the Difference in Your Photos",
    category: "Photography",
    date: "January 15, 2026",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    content: [
      "If you've ever noticed that some photos seem to glow with a warm, magical light, chances are they were taken during golden hour. This is the period shortly after sunrise or before sunset when the sun is low in the sky, casting a warm, diffused light that is universally flattering.",
      "As a photographer, golden hour is my absolute favorite time to shoot. The light during this window is soft and directional, creating gentle shadows that add dimension to portraits without the harshness of midday sun. Skin tones look warm and natural, and the world takes on this dreamy, almost cinematic quality.",
      "For couples sessions, I strongly recommend scheduling during golden hour whenever possible. The light does so much of the heavy lifting -- it wraps around you, creates beautiful rim lighting in your hair, and turns ordinary backgrounds into something extraordinary.",
      "Of course, golden hour isn't always possible, especially for events and weddings with fixed timelines. In those cases, I know how to work with any lighting condition. But when we have the flexibility to choose? Golden hour wins every single time.",
    ],
  },
  "wedding-timeline-guide": {
    title: "How to Build the Perfect Wedding Day Timeline",
    category: "Weddings",
    date: "December 30, 2025",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    content: [
      "Your wedding day timeline is one of the most important planning elements that often gets overlooked until the last minute. A well-crafted timeline ensures you have time for everything that matters, reduces stress, and gives your photographer the best conditions for stunning images.",
      "Start with the non-negotiables: ceremony time, sunset time, and venue access windows. These anchor points will dictate the flow of everything else. From there, I recommend working backward from the ceremony to plan your getting-ready timeline and forward into the reception.",
      "One of the biggest mistakes I see is not allocating enough time for portraits. I recommend at minimum 30 minutes for couple portraits and 20 minutes for family formals. If you want a first look, add another 20-30 minutes. Trust me, you won't regret having this time built in.",
      "Build in buffer time! Things will run late -- it's the nature of weddings. I recommend 15-minute buffers between major transitions (getting ready to ceremony, ceremony to cocktail hour, etc.). This small adjustment can be the difference between a relaxed and a stressful day.",
      "For golden hour portraits (which I highly recommend), plan to step away from the reception for 15-20 minutes around sunset. Your guests will be enjoying the party, and you'll get the most romantic, magazine-worthy images of the day.",
      "I provide every couple with a detailed timeline template and work closely with your planner/coordinator to ensure everything flows seamlessly. This is one of the many reasons hiring an experienced photographer makes all the difference.",
    ],
  },
};

const defaultPost = {
  title: "Blog Post",
  category: "Photography",
  date: "2026",
  readTime: "5 min read",
  image:
    "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  content: [
    "This blog post is coming soon. Check back for updates!",
  ],
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPostData[slug as string || ""] || defaultPost;

  return (
    <div className="bg-brand-secondary">
      {/* Hero Image */}
      <section className="pt-20">
        <div className="h-[50vh] min-h-[350px] relative">
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-main/50 to-transparent" />
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-main/50 hover:text-brand-main transition-colors mb-8"
            style={{ fontSize: "0.8rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span
                className="px-3 py-1 bg-brand-warm text-brand-tertiary-dark tracking-[0.1em] uppercase"
                style={{ fontSize: "0.6rem" }}
              >
                {post.category}
              </span>
              <span
                className="text-brand-main/40 flex items-center gap-1"
                style={{ fontSize: "0.75rem" }}
              >
                <Calendar className="w-3 h-3" />
                {post.date}
              </span>
              <span
                className="text-brand-main/40 flex items-center gap-1"
                style={{ fontSize: "0.75rem" }}
              >
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            <h1
              className="font-serif text-brand-main mb-10"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: "1.2",
              }}
            >
              {post.title}
            </h1>

            <div className="space-y-6">
              {post.content.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-brand-main/70"
                  style={{ fontSize: "0.95rem", lineHeight: "2" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Author */}
          <div className="mt-16 pt-8 border-t border-brand-main/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center">
              <span className="font-serif text-brand-tertiary" style={{ fontSize: "1.1rem" }}>
                MW
              </span>
            </div>
            <div>
              <p className="text-brand-main font-serif" style={{ fontSize: "1rem" }}>
                Mae Win
              </p>
              <p className="text-brand-main/50" style={{ fontSize: "0.8rem" }}>
                San Francisco, CA &middot; Photographer & Storyteller
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-10 bg-brand-warm text-center">
            <h3
              className="font-serif text-brand-main mb-3"
              style={{ fontSize: "1.3rem" }}
            >
              Inspired by What You Read?
            </h3>
            <p
              className="text-brand-main/60 mb-6"
              style={{ fontSize: "0.9rem" }}
            >
              Let's create your own beautiful story together.
            </p>
            <Link
              href="/inquire"
              className="inline-block px-8 py-3.5 bg-brand-tertiary text-white tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-tertiary-dark"
              style={{ fontSize: "0.7rem" }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
