const BROWSER_SAFE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const CONVERTIBLE_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/tiff",
  "image/bmp",
]);

const BROWSER_SAFE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "jfif",
]);

const CONVERTIBLE_EXTENSIONS = new Set(["heic", "heif", "tif", "tiff", "bmp"]);

function fileExtension(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase().trim();
  return ext || "";
}

export function isSupportedImageUpload(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  const ext = fileExtension(file);

  if (mime.startsWith("image/")) {
    return (
      BROWSER_SAFE_MIME_TYPES.has(mime) ||
      CONVERTIBLE_MIME_TYPES.has(mime) ||
      BROWSER_SAFE_EXTENSIONS.has(ext) ||
      CONVERTIBLE_EXTENSIONS.has(ext)
    );
  }

  // Some browsers omit MIME for HEIC and TIFF files.
  return BROWSER_SAFE_EXTENSIONS.has(ext) || CONVERTIBLE_EXTENSIONS.has(ext);
}

export function imageUploadAcceptList(): string {
  return ".jpg,.jpeg,.png,.webp,.gif,.avif,.jfif,.heic,.heif,.tif,.tiff,.bmp,image/*";
}
