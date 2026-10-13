import { ASSET_URL, API_BASE_URL, API_URL } from "@/lib/APIUrl";
import { STATUS_CODE } from "@/lib/Constant";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";

// CMS images live under the API server's /uploads/ static mount.
// Prefer NEXT_PUBLIC_BACK_END_ASSET_URL when set; otherwise derive from
// API_BASE_URL (which already points at the API host).
const stripTrailingSlash = (s) => (s && s.endsWith("/") ? s.slice(0, -1) : s || "");

const uploadHost = () => stripTrailingSlash(ASSET_URL || API_BASE_URL || "");

export const resolveCmsImage = (path) => {
    if (!path) return "";
    if (typeof window !== "undefined" && path instanceof File) {
        return URL.createObjectURL(path);
    }
    if (typeof path !== "string") return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) return path;
    const host = uploadHost();
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return host ? `${host}/${clean}` : `/${clean}`;
};

export const uploadCmsImage = async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append("image", file);
    const result = await callApi(API_URL.UPLOAD_CMS_IMAGE, "POST", form, token);
    if (result?.errorCode === STATUS_CODE.OK) {
        // Return absolute URL if available (important for S3 previews), fallback to path
        return result?.data?.url || result?.data?.path || "";
    }
    throw new Error(result?.message || "Upload failed");
};

const isPlainObject = (value) => {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};

// Recursively walks the object tree, finds all File instances, uploads them,
// and replaces them with their uploaded S3/local URLs.
export const uploadPendingFiles = async (value, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;

    if (typeof window !== "undefined" && value instanceof File) {
        return await uploadCmsImage(value);
    }

    if (Array.isArray(value)) {
        if (seen.has(value)) return value;
        seen.add(value);
        // Process array elements concurrently
        return await Promise.all(value.map((v) => uploadPendingFiles(v, seen)));
    }

    if (typeof value === "object" && isPlainObject(value)) {
        if (seen.has(value)) return value;
        seen.add(value);
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = await uploadPendingFiles(v, seen);
        }
        return out;
    }

    return value;
};
