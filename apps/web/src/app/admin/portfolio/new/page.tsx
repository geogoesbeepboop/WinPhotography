"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Save, Upload } from "lucide-react";

const categories = ["Elopements", "Proposals", "Weddings", "Graduations", "Headshots", "Events"];

export default function AdminPortfolioNew() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    featured: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/portfolio");
  };

  return (
    <div>
      <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-brand-main/40 hover:text-brand-main transition-colors mb-6" style={{ fontSize: "0.8rem" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Portfolio
      </Link>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-brand-main mb-1" style={{ fontSize: "1.8rem" }}>Add Portfolio Collection</h1>
        <p className="text-brand-main/50 mb-8" style={{ fontSize: "0.9rem" }}>Create a new portfolio collection for your public website.</p>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white border border-brand-main/8 p-6 space-y-5">
            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Collection Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Golden Hour at Baker Beach"
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.9rem" }}
                required />
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors" style={{ fontSize: "0.9rem" }}
                required>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-brand-main mb-1.5 tracking-[0.05em]" style={{ fontSize: "0.75rem" }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this collection..."
                rows={3}
                className="w-full px-4 py-3 bg-brand-secondary border border-brand-main/10 text-brand-main focus:outline-none focus:border-brand-tertiary transition-colors resize-none" style={{ fontSize: "0.85rem" }} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-brand-tertiary" />
              <span className="text-brand-main" style={{ fontSize: "0.85rem" }}>Feature this collection on the homepage</span>
            </label>
          </div>

          {/* Upload area */}
          <div className="bg-white border-2 border-dashed border-brand-main/15 p-10 text-center hover:border-brand-tertiary/40 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-brand-main/20 mx-auto mb-3" />
            <p className="text-brand-main/50 mb-1" style={{ fontSize: "0.9rem" }}>Upload Collection Photos</p>
            <p className="text-brand-main/30" style={{ fontSize: "0.75rem" }}>Drag & drop or click to browse · JPG, PNG up to 20MB each</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-main text-brand-secondary hover:bg-brand-main-light transition-colors tracking-[0.1em] uppercase" style={{ fontSize: "0.65rem" }}>
              <Save className="w-3.5 h-3.5" /> Save Collection
            </button>
            <Link href="/admin/portfolio" className="text-brand-main/40 hover:text-brand-main transition-colors" style={{ fontSize: "0.8rem" }}>Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
