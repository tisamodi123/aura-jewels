import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRoot = path.resolve(__dirname, "..", "uploads");

export const uploadsPath = (...segments) => path.join(uploadsRoot, ...segments);

// Normalises an incoming asset reference down to a relative path. The DB
// should only ever store paths like `uploads/categoryImages/foo.jpg` —
// never full URLs with a host. This matters because some GET endpoints
// (e.g. category detail) absolutize their image fields server-side for
// rendering, then the admin edit form sends those back unchanged. Without
// stripping, a single edit-and-save round-trip would persist
// `http://localhost:5000/api/uploads/...` into the DB, which then
// breaks the next time the server runs on a different host/port.
//
// Behaviour:
//   ""           → ""
//   "uploads/x"  → "uploads/x"
//   "/uploads/x" → "uploads/x"
//   "http://host/prefix/uploads/x" → "uploads/x"
//   anything that doesn't contain "/uploads/" is returned as-is so
//   external URLs (e.g. third-party CDN links) survive.
export const stripAssetHost = (value) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;
  if (value === "") return "";
  // Pull the path component out of full URLs first so we don't
  // accidentally match "uploads" in a query string or domain.
  let p = value;
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      // Fall through — malformed URL, just look for /uploads/ below.
    }
  }
  const idx = p.indexOf("/uploads/");
  if (idx !== -1) return p.slice(idx + 1); // drop the leading "/"
  if (p.startsWith("uploads/")) return p;
  if (p.startsWith("/uploads/")) return p.slice(1);
  return value;
};

// Builds a public asset URL for a read response. Handles three on-disk
// shapes that exist across the codebase:
//   1. Empty / null              → undefined (caller decides default)
//   2. Already absolute URL      → returned unchanged
//   3. Starts with "uploads/"    → `${baseUrl}/<path>` (modern format,
//                                  used by CMS upload helper)
//   4. Anything else (basename)  → `${baseUrl}/<defaultDir>/<basename>`
//                                  (legacy format — e.g. category top-level
//                                  image stored as just "foo.jpg")
//
// Use this anywhere the response previously did manual string concatenation
// like `${baseUrl}/uploads/categoryImages/${field.image}` — it stays
// compatible with the old data while supporting the new uploads/... shape
// that admin-side normalisation produces.
export const resolveAssetUrl = (value, baseUrl, defaultDir) => {
  if (!value || typeof value !== "string") return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const useAWS =
    process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";

  if (useAWS) {
    const filename = value.split("/").pop();
    const uploadPath = process.env.AWS_UPLOAD_PATH;
    if (defaultDir && defaultDir.includes("category")) {
      return `${uploadPath}website-assets/categories/${filename}`;
    }
    if (defaultDir && defaultDir.includes("collection")) {
      return `${uploadPath}website-assets/collections/${filename}`;
    }
    if (defaultDir && defaultDir.includes("cms")) {
      return `${uploadPath}website-assets/cms/${filename}`;
    }
    if (defaultDir && (defaultDir.includes("custom-order") || defaultDir.includes("customOrder"))) {
      return `${uploadPath}website-assets/custom-orders/${filename}`;
    }
    if (defaultDir && (defaultDir.includes("offer") || defaultDir.includes("offerImage"))) {
      return `${uploadPath}website-assets/offerImage/${filename}`;
    }
    if (defaultDir && defaultDir.includes("receipt")) {
      return `${uploadPath}website-assets/receipts/${filename}`;
    }
    if (defaultDir && defaultDir.includes("invoice")) {
      return `${uploadPath}website-assets/invoices/${filename}`;
    }
    return `${uploadPath}website-assets/temp/${filename}`;
  }

  if (!baseUrl) return value;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const trimmed = value.startsWith("/") ? value.slice(1) : value;
  if (trimmed.startsWith("uploads/")) return `${base}/${trimmed}`;
  const dir = (defaultDir || "").replace(/^\/+|\/+$/g, "");
  return dir ? `${base}/${dir}/${trimmed}` : `${base}/${trimmed}`;
};

// Builds the public URL of a file the user just UPLOADED (a multer file object),
// for storing on an import-history row.
//
// The two storage backends expose the location on different properties, and
// that is the whole trap here:
//
//   * Local dev  → `uploadFiles` uses multer.diskStorage, which sets `file.path`
//                  (an absolute on-disk path). It is served by the
//                  `${basePath}uploads` express.static mount in server.js.
//   * Production → `uploadFilesOnAWS` uses multer.memoryStorage and pushes the
//                  buffer to S3. memoryStorage NEVER sets `file.path`; the
//                  public URL is put on `file.uploadedPath` instead.
//
// Reading only `file.path` therefore yields null on the server, which is why the
// uploaded source file could not be downloaded there while the generated
// Success/Rejected sheets (which go through create_excel_files → S3) could.
export const resolveUploadedFileUrl = (file, baseUrl) => {
  if (!file) return null;

  // S3 (production): already a full, public URL.
  if (file.uploadedPath) return file.uploadedPath;

  // Disk (local): turn the absolute path into a /uploads/... URL.
  const diskPath = file.path || "";
  const relative = diskPath.split("uploads")[1];
  if (!relative) return null;

  const base = baseUrl && baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : (baseUrl || "");
  return `${base}/uploads${relative.replace(/\\/g, "/")}`;
};

// Helper to determine filename for uploaded files or fallback to body values (cleaning hosts/directories)
// It handles 3 possible scenarios:

// User uploads a new file → save the new filename.
// User doesn't upload a new file but sends an existing image URL → extract and save only the filename.
// User clears/removes the image → save empty/null appropriately.
export const getUploadedOrCleanFilename = (req, fieldname, bodyValue) => {
  const file = req.files?.find?.((x) => x.fieldname === fieldname);
  if (file) {
    return file.filename;
  }
  if (bodyValue === undefined) {
    return undefined;
  }
  if (!bodyValue || typeof bodyValue !== "string") {
    return bodyValue === "" ? "" : null;
  }
  const stripped = stripAssetHost(bodyValue);
  return stripped.split("/").pop();
};
