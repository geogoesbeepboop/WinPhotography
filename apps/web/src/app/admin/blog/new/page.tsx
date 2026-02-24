"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  Upload,
  X,
  Loader2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Pilcrow,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCreateBlogPost, useUpdateBlogPost, useAdminBlogPosts } from "@/services/blog";
import { uploadBlogCoverImage } from "@/services/upload";
import { resolveMediaUrl } from "@/lib/media";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { imageUploadAcceptList, isSupportedImageUpload } from "@/lib/image-upload";
import {
  htmlToMarkdown,
  isLikelyMarkdown,
  markdownToHtml,
} from "@/lib/rich-text-markdown";

function BlogEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { data: posts } = useAdminBlogPosts();
  const createBlog = useCreateBlogPost();
  const updateBlog = useUpdateBlogPost();

  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [hasInitializedEditData, setHasInitializedEditData] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    coverImageUrl: "",
    content: "",
  });

  // Load post data when editing
  useEffect(() => {
    if (!editId) {
      setHasInitializedEditData(false);
      return;
    }

    if (hasInitializedEditData || !posts) return;

    if (editId && posts) {
      const post = posts.find((p: any) => p.id === editId);
      if (post) {
        const markdownContent = post.content || "";
        setForm({
          title: post.title || "",
          category: post.category || "",
          excerpt: post.excerpt || "",
          coverImageUrl: post.coverImageUrl || "",
          content: markdownContent,
        });
        setEditorHtml(markdownToHtml(markdownContent));
        setHasInitializedEditData(true);
      }
    }
  }, [editId, hasInitializedEditData, posts]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== editorHtml) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [editorHtml]);

  const syncEditorToMarkdown = () => {
    if (!editorRef.current) {
      return form.content;
    }

    const html = editorRef.current?.innerHTML || "";
    const markdown = htmlToMarkdown(html);
    setEditorHtml(html);
    setForm((prev) => ({ ...prev, content: markdown }));
    return markdown;
  };

  const runEditorCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    syncEditorToMarkdown();
  };

  const setBlockType = (blockType: "H1" | "H2" | "P" | "BLOCKQUOTE") => {
    runEditorCommand("formatBlock", blockType);
  };

  const handleEditorInput = () => {
    syncEditorToMarkdown();
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedHtml = e.clipboardData.getData("text/html");
    const pastedText = e.clipboardData.getData("text/plain");

    // Let native behavior handle already-rich HTML paste.
    if (pastedHtml?.trim()) return;

    if (pastedText && isLikelyMarkdown(pastedText)) {
      e.preventDefault();
      runEditorCommand("insertHTML", markdownToHtml(pastedText));
    }
  };

  const togglePreview = () => {
    if (!preview) {
      syncEditorToMarkdown();
    }
    setPreview((prev) => !prev);
  };

  const handleCoverUpload = async (file: File) => {
    if (!isSupportedImageUpload(file)) {
      setError(
        "Unsupported image format. Use JPG, PNG, WEBP, GIF, AVIF, or HEIC/HEIF/TIFF/BMP (auto-converted to JPG).",
      );
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { key } = await uploadBlogCoverImage(file);
      // Persist the storage key so environments can render through their own API host.
      setForm((prev) => ({ ...prev, coverImageUrl: key }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to upload cover image. Please try again.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleCoverUpload(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleCoverUpload(file);
        return;
      }
    }
  };

  const handleSave = async (publish: boolean) => {
    setError("");
    const currentMarkdown = syncEditorToMarkdown();

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!currentMarkdown.trim()) {
      setError("Content is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      content: currentMarkdown,
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
              Write with the visual editor, markdown supported on paste
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePreview}
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
            <div className="bg-card border border-brand-main/10">
              <div className="flex flex-wrap items-center gap-1 border-b border-brand-main/10 p-2">
                <button
                  type="button"
                  onClick={() => runEditorCommand("bold")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => runEditorCommand("italic")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType("H1")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Heading"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType("H2")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Subtitle"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType("P")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Paragraph"
                >
                  <Pilcrow className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => runEditorCommand("insertUnorderedList")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => runEditorCommand("insertOrderedList")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType("BLOCKQUOTE")}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt("Enter URL");
                    if (url?.trim()) {
                      runEditorCommand("createLink", url.trim());
                    }
                  }}
                  className="p-2 text-brand-main/60 hover:text-brand-main hover:bg-brand-main/5 transition-colors"
                  title="Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative min-h-[500px]">
                {!form.content.trim() && (
                  <p
                    className="absolute top-4 left-4 text-brand-main/30 pointer-events-none"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Start writing here. You can also paste markdown and it will auto-format.
                  </p>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onPaste={handleEditorPaste}
                  className="w-full min-h-[500px] px-4 py-3 text-brand-main focus:outline-none [&_h1]:font-serif [&_h1]:text-[2rem] [&_h1]:leading-[1.2] [&_h1]:mb-4 [&_h2]:font-serif [&_h2]:text-[1.5rem] [&_h2]:leading-[1.3] [&_h2]:mb-3 [&_h2]:mt-2 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-tertiary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-brand-main/60 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:my-3 [&_ol]:my-3 [&_p]:my-3"
                  style={{ fontSize: "0.95rem", lineHeight: "1.8" }}
                />
              </div>
            </div>
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

          {/* Cover Image */}
          <div
            className="bg-card border border-brand-main/10 p-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-2" style={{ fontSize: "0.6rem" }}>
              Cover Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept={imageUploadAcceptList()}
              onChange={handleFileSelect}
              className="hidden"
            />

            {form.coverImageUrl ? (
              <div className="relative group">
                <div className="aspect-video overflow-hidden bg-brand-main/5">
                  <ImageWithFallback
                    src={resolveMediaUrl(form.coverImageUrl)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, coverImageUrl: "" })}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-main/15 p-6 text-center hover:border-brand-tertiary/40 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-brand-tertiary animate-spin mx-auto mb-2" />
                ) : (
                  <Upload className="w-6 h-6 text-brand-main/20 mx-auto mb-2" />
                )}
                <p className="text-brand-main/40" style={{ fontSize: "0.8rem" }}>
                  {uploading ? "Uploading..." : "Drop image, click to browse, or paste"}
                </p>
                <p className="text-brand-main/30 mt-1" style={{ fontSize: "0.7rem" }}>
                  HEIC/HEIF images are converted to JPG when supported.
                </p>
              </div>
            )}

            {/* URL input as fallback */}
            <input
              type="text"
              placeholder="Or paste an image URL / storage key..."
              value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              className="w-full mt-3 px-3 py-2 bg-transparent border border-brand-main/10 text-brand-main placeholder:text-brand-main/30 focus:outline-none focus:border-brand-main/30"
              style={{ fontSize: "0.8rem" }}
            />
          </div>

          {/* Editor Tips */}
          <div className="bg-card border border-brand-main/10 p-5">
            <label className="block text-brand-main/50 tracking-[0.1em] uppercase mb-3" style={{ fontSize: "0.6rem" }}>
              Editor Tips
            </label>
            <div className="space-y-2 text-brand-main/45" style={{ fontSize: "0.78rem", lineHeight: "1.6" }}>
              <p>Use the toolbar for bold, italic, headings, lists, quotes, and links.</p>
              <p>Paste markdown directly and it will auto-convert to rich formatting.</p>
              <p>Save and publish still store markdown for public rendering compatibility.</p>
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
