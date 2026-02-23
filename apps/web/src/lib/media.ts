import { API_URL } from "@/lib/constants";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:");
}

function toProxyUrl(key: string): string {
  return `${API_URL}/storage/image?key=${encodeURIComponent(key)}`;
}

function normalizeStorageKey(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (isAbsoluteUrl(value)) {
    try {
      const url = new URL(value);
      if (!url.pathname.includes("/storage/image")) {
        return null;
      }
      const key = url.searchParams.get("key");
      if (key) return key;
      return null;
    } catch {
      return null;
    }
  }

  if (value.startsWith("/")) {
    if (value.includes("/storage/image")) {
      try {
        const url = new URL(value, "http://localhost");
        const key = url.searchParams.get("key");
        if (key) return key;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Raw object key (e.g. blog/uuid.jpg or portfolio/item/uuid.jpg).
  return value;
}

/**
 * Converts raw storage keys (e.g. "portfolio/uuid/file.jpg") into
 * API image proxy URLs while leaving fully-qualified URLs untouched.
 */
export function resolveMediaUrl(input?: string | null): string {
  if (!input) return "";
  const key = normalizeStorageKey(input);
  if (key) return toProxyUrl(key);
  if (isAbsoluteUrl(input) || input.startsWith("/")) return input;
  return toProxyUrl(input);
}
