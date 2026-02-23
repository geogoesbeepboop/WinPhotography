import { API_URL } from "@/lib/constants";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:");
}

/**
 * Converts raw storage keys (e.g. "portfolio/uuid/file.jpg") into
 * API image proxy URLs while leaving fully-qualified URLs untouched.
 */
export function resolveMediaUrl(input?: string | null): string {
  if (!input) return "";
  if (isAbsoluteUrl(input) || input.startsWith("/")) return input;
  return `${API_URL}/storage/image?key=${encodeURIComponent(input)}`;
}
