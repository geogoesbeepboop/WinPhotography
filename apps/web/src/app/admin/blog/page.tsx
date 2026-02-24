"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Eye, EyeOff, Trash2, Edit2, Clock, Calendar } from "lucide-react";
import { useAdminBlogPosts, useDeleteBlogPost, useUpdateBlogPost } from "@/services/blog";
import { resolveMediaUrl } from "@/lib/media";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700" },
};

export default function AdminBlogPage() {
  const router = useRouter();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const deleteBlog = useDeleteBlogPost();
  const updateBlog = useUpdateBlogPost();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const filtered = (posts ?? []).filter((p: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q)
    );
  });

  const handleTogglePublish = (post: any) => {
    updateBlog.mutate({
      id: post.id,
      isPublished: !post.isPublished,
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteBlog.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-brand-main" style={{ fontSize: "1.6rem" }}>Blog</h1>
            <p className="text-brand-main/50 mt-1" style={{ fontSize: "0.8rem" }}>Manage blog posts</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 animate-pulse">
              <div className="h-5 bg-brand-main/10 rounded w-1/3 mb-3" />
              <div className="h-4 bg-brand-main/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-brand-main" style={{ fontSize: "1.6rem" }}>Blog</h1>
          <p className="text-brand-main/50 mt-1" style={{ fontSize: "0.8rem" }}>
            {filtered.length} post{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-main text-brand-secondary tracking-[0.1em] uppercase hover:bg-brand-main/90 transition-colors"
          style={{ fontSize: "0.7rem" }}
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-main/30" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
      </div>

      {/* Posts List */}
      {filtered.length === 0 ? (
        <div className="bg-card p-12 text-center">
          <FileText className="w-10 h-10 text-brand-main/20 mx-auto mb-3" />
          <p className="text-brand-main/50" style={{ fontSize: "0.9rem" }}>
            {search ? "No posts match your search" : "No blog posts yet"}
          </p>
          {!search && (
            <Link
              href="/admin/blog/new"
              className="inline-block mt-4 px-5 py-2 bg-brand-main text-brand-secondary tracking-[0.1em] uppercase"
              style={{ fontSize: "0.65rem" }}
            >
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post: any) => (
            <div
              key={post.id}
              className="bg-card p-5 flex items-center gap-4 group hover:shadow-sm transition-shadow"
            >
              {/* Cover thumbnail */}
              {post.coverImageUrl && (
                <div className="w-16 h-16 shrink-0 overflow-hidden bg-brand-main/5">
                  <ImageWithFallback
                    src={resolveMediaUrl(post.coverImageUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-brand-main font-medium truncate"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {post.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 shrink-0 ${
                      post.isPublished
                        ? statusConfig.published.color
                        : statusConfig.draft.color
                    }`}
                    style={{ fontSize: "0.6rem" }}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-brand-main/40" style={{ fontSize: "0.75rem" }}>
                  {post.category && (
                    <span className="px-2 py-0.5 bg-brand-warm text-brand-main/60">
                      {post.category}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                </div>
                {post.excerpt && (
                  <p
                    className="text-brand-main/40 mt-1 truncate"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleTogglePublish(post)}
                  className="p-2 text-brand-main/30 hover:text-brand-main transition-colors"
                  title={post.isPublished ? "Unpublish" : "Publish"}
                >
                  {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => router.push(`/admin/blog/new?edit=${post.id}`)}
                  className="p-2 text-brand-main/30 hover:text-brand-main transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: post.id, title: post.title || "this post" })}
                  className="p-2 text-brand-main/30 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteBlog.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
