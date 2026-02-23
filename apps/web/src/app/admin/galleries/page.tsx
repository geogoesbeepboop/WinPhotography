"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { Image, PlusCircle, Eye, EyeOff, Calendar, User, Search } from "lucide-react";
import { useGalleries } from "@/services/galleries";

interface GalleryListItem {
  id: string;
  title: string;
  status: string;
  clientName?: string;
  client?: { fullName?: string };
  photoCount?: number;
  createdAt?: string;
  publishedAt?: string;
}

export default function AdminGalleries() {
  const { data: galleries = [], isLoading } = useGalleries();
  const [search, setSearch] = useState("");
  const galleryList = galleries as GalleryListItem[];

  const filtered = galleryList.filter((gal) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const title = (gal.title || "").toLowerCase();
    const clientName = (gal.clientName || gal.client?.fullName || "").toLowerCase();
    return title.includes(q) || clientName.includes(q);
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="h-8 w-40 bg-brand-main/10 animate-pulse mb-1" />
            <div className="h-4 w-64 bg-brand-main/5 animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-brand-main/10 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-brand-main/8 p-5">
              <div className="h-5 w-48 bg-brand-main/10 animate-pulse mb-2" />
              <div className="h-3 w-72 bg-brand-main/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Galleries</h1>
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>Create and manage client photo galleries.</p>
        </div>
        <Link href="/admin/galleries/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
          <PlusCircle className="w-3.5 h-3.5" /> New Gallery
        </Link>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search galleries..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.85rem" }} />
      </div>

      <div className="space-y-3">
        {filtered.map((gal, i) => (
          <motion.div key={gal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/admin/galleries/${gal.id}`} className="block bg-white border border-brand-main/8 p-5 hover:border-brand-tertiary/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-brand-main" style={{ fontSize: "1rem" }}>{gal.title}</h3>
                    {gal.status === "published" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700" style={{ fontSize: "0.6rem" }}><Eye className="w-3 h-3" /> Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700" style={{ fontSize: "0.6rem" }}><EyeOff className="w-3 h-3" /> Draft</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{gal.clientName || gal.client?.fullName || "Unknown"}</span>
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" />{gal.photoCount ?? 0} photos</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{gal.createdAt}</span>
                  </div>
                </div>
                {gal.publishedAt && (
                  <p className="text-brand-main/30" style={{ fontSize: "0.7rem" }}>Published {gal.publishedAt}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Image className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No galleries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
