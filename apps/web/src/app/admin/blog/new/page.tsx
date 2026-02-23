"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCreateBlogPost, useUpdateBlogPost, useAdminBlogPosts } from "@/services/blog";

function BlogEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { data: posts } = useAdminBlogPosts();
  const createBlog = useCreateBlogPost();
  const updateBlog = useUpdateBlogPost();

  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    coverImageUrl: "",
    content: "",
  });

  // Load post data when editing
  useEffect(() => {
    if (editId && posts) {
      const post = posts.find((p: any) => p.id === editId);
      if (post) {
        setForm({
          title: post.title || "",
          category: post.category || "",
          excerpt: post.excerpt || "",
          coverImageUrl: post.coverImageUrl || "",
          content: post.content || "",
        });
      }
    }
  }, [editId, posts]);

  const handleSave = async (publish: boolean) => {
    setError("");
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.content.trim()) {
      setError("Content is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      content: form.content,
      isPublished: publish,
    };

    try {
      if (editId) {
        await updateBlog.mutateAsync({ id: editId, ...payload });
      } else {
        await createBlog.mutateAsync(payload);
      }
      router.push("/admin/blog");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save post";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const isPending = createBlog.isPending || updateBlog.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 text-brand-main/40 hover:text-brand-main transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-brand-main" style={{ fontSize: "1.6rem" }}>
              {editId ? "Edit Post" : "New Post"}
            </h1>
            <p className="text-brand-main/50 mt-1" style={{ fontSize: "0.8rem" }}>
              Write in Markdown for rich formatting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-4 py-2.5 border transition-colors ${
              preview
                ? "border-brand-tertiary text-brand-tertiary"
                : "border-brand-main/20 text-brand-main/60 hover:text-brand-main"
            }`}
            style={{ fontSize: "0.7rem" }}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-main/20 text-brand-main/60 hover:text-brand-main transition-colors disabled:opacity-50"
            style={{ fontSize: "0.7rem" }}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary tracking-[0.1em] uppercase hover:bg-brand-main/90 transition-colors disabled:opacity-50"
            style={{ fontSize: "0.7rem" }}
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Post title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-card border border-brand-main/10 text-brand-main font-serif placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30"
            style={{ fontSize: "1.3rem" }}
          />

          {/* Content / Preview */}
          {preview ? (
            <div className="bg-card border border-brand-main/10 p-8 min-h-[500px] prose prose-brand max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-serif text-brand-main mb-4" style={{ fontSize: "2rem", lineHeight: "1.2" }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif text-brand-main mb-3" style={{ fontSize: "1.5rem", lineHeight: "1.3" }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-serif text-brand-main mb-2" style={{ fontSize: "1.2rem", lineHeight: "1.4" }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-brand-main/70 mb-4" style={{ fontSize: "0.95rem", lineHeight: "2" }}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-brand-main/70 mb-4 space-y-1" style={{ fontSize: "0.95rem" }}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-brand-main/70 mb-4 space-y-1" style={{ fontSize: "0.95rem" }}>
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-brand-tertiary pl-4 italic text-brand-main/60 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {form.content || "*Start writing to see the preview...*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              placeholder="Write your post content in Markdown..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30 min-h-[500px] resize-y font-mono"
              style={{ fontSize: "0.85rem", lineHeight: "1.8" }}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="bg-card border border-brand-main/10 p-5">
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-2" style={{ fontSize: "0.6rem" }}>
              Category
            </label>
            <input
              type="text"
              placeholder="e.g., Weddings, Tips & Advice"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-transparent border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30"
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-brand-main/10 p-5">
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-2" style={{ fontSize: "0.6rem" }}>
              Excerpt
            </label>
            <textarea
              placeholder="Brief summary for the blog listing..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 bg-transparent border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30 resize-y"
              rows={3}
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          {/* Cover Image URL */}
          <div className="bg-card border border-brand-main/10 p-5">
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-2" style={{ fontSize: "0.6rem" }}>
              Cover Image URL
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              className="w-full px-3 py-2 bg-transparent border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30"
              style={{ fontSize: "0.85rem" }}
            />
            {form.coverImageUrl && (
              <div className="mt-3 aspect-video overflow-hidden bg-brand-main/5">
                <img
                  src={form.coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Markdown Help */}
          <div className="bg-card border border-brand-main/10 p-5">
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-3" style={{ fontSize: "0.6rem" }}>
              Markdown Guide
            </label>
            <div className="space-y-2 text-brand-main/40 font-mono" style={{ fontSize: "0.75rem" }}>
              <p># Heading 1</p>
              <p>## Heading 2</p>
              <p>**bold text**</p>
              <p>*italic text*</p>
              <p>- bullet point</p>
              <p>1. numbered list</p>
              <p>&gt; blockquote</p>
              <p>[link text](url)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogNewPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-8 bg-brand-main/10 rounded w-1/4 mb-8" />
          <div className="h-64 bg-brand-main/10 rounded" />
        </div>
      }
    >
      <BlogEditor />
    </Suspense>
  );
}
