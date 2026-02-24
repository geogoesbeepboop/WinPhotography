import { API_URL } from "@/lib/constants";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:");
}

function toProxyUrl(key: string): string {
  return `${API_URL}/storage/image?key=${encodeURIComponent(key)}`;
}

function isStorageProxyPath(value: string): boolean {
  return value.includes("/storage/image");
}

function extractStorageKeyFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!isStorageProxyPath(url.pathname)) {
      return null;
    }
    const key = url.searchParams.get("key");
    return key?.trim() || null;
  } catch {
    return null;
  }
}

function extractStorageKeyFromRelativeUrl(value: string): string | null {
  try {
    const url = new URL(value, "http://localhost");
    if (!isStorageProxyPath(url.pathname)) {
      return null;
    }
    const key = url.searchParams.get("key");
    return key?.trim() || null;
  } catch {
    return null;
  }
}

function normalizeStorageKey(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (isAbsoluteUrl(value)) {
    return extractStorageKeyFromUrl(value);
  }

  if (value.startsWith("/")) {
    if (isStorageProxyPath(value)) {
      return extractStorageKeyFromRelativeUrl(value);
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
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Guard against malformed proxy URLs like "/storage/image?key="
  if (isStorageProxyPath(trimmed)) {
    const key = normalizeStorageKey(trimmed);
    return key ? toProxyUrl(key) : "";
  }

  const key = normalizeStorageKey(trimmed);
  if (key) return toProxyUrl(key);
  if (isAbsoluteUrl(trimmed) || trimmed.startsWith("/")) return trimmed;
  return toProxyUrl(trimmed);
}
