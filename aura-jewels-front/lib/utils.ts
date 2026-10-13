import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL, noImgFound, FRONT_URL } from "./Api_Url";
import { PREFIX } from "./constants";
import { successMsg } from "./toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (url?: any): string => {
  if (!url) return noImgFound;
  let strUrl = "";
  if (typeof url === 'string') {
    strUrl = url;
  } else if (Array.isArray(url) && url.length > 0) {
    return getImageUrl(url[0]);
  } else if (typeof url === 'object') {
    const candidate = url.MediaLocation || url.url || url.image || url.default_image || url.path || url.location || url.src || url.filename || url.uri || url.href;
    if (typeof candidate === 'string') {
      strUrl = candidate;
    } else if (typeof candidate === 'object' && candidate !== null) {
      return getImageUrl(candidate);
    }
  }
  if (!strUrl || typeof strUrl !== 'string' || !strUrl.trim()) return noImgFound;

  if (strUrl.startsWith('data:') || strUrl.startsWith('http://') || strUrl.startsWith('https://')) {
    return strUrl;
  }
  const cleanUrl = strUrl.startsWith('/') ? strUrl.slice(1) : strUrl;
  if (!cleanUrl.trim()) return noImgFound;

  // CMS uploads live on the API server, not the storefront's public folder.
  // Route any `uploads/...` path to the API base URL instead of PREFIX.
  if (cleanUrl.startsWith('uploads/')) {
    const baseUrl = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '';
    return baseUrl ? `${baseUrl}/${cleanUrl}` : `/${cleanUrl}`;
  }
  return PREFIX ? `${PREFIX}/${cleanUrl}` : `/${cleanUrl}`;
};

export const handleShareProduct = (product: any) => {
  const cleanFrontUrl = FRONT_URL ? FRONT_URL.replace(/\/$/, '') : '';
  const shareUrl = cleanFrontUrl
    ? `${cleanFrontUrl}/product/${product.slug || product._id}`
    : typeof window !== 'undefined' ? window.location.href : '';

  if (!shareUrl) return;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(shareUrl);
    } else if (typeof document !== 'undefined') {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
      } catch (err) {
        document.body.removeChild(textArea);
        return Promise.reject(err);
      }
    }
    return Promise.reject(new Error('Clipboard copy not supported'));
  };

  handleCopy()
    .then(() => {
      successMsg('Link copied to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};

export const formatTitle = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  if (/^[a-z]+([A-Z][a-z]*)+$/.test(str)) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (s) => s.toUpperCase());
  }
  return str;
};
