"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Image, PlusCircle, Eye, EyeOff, Calendar, User } from "lucide-react";
import { mockGalleries } from "@/lib/mock-data/admin-data";

export default function AdminGalleries() {
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

      <div className="space-y-3">
        {mockGalleries.map((gal, i) => (
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
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{gal.clientName}</span>
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" />{gal.photoCount} photos</span>
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

        {mockGalleries.length === 0 && (
          <div className="text-center py-16">
            <Image className="w-8 h-8 text-brand-main/15 mx-auto mb-3" />
            <p className="text-brand-main/40" style={{ fontSize: "0.9rem" }}>No galleries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
