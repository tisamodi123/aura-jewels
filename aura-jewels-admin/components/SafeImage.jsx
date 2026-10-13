"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SafeImage({
  src,
  alt,
  width = 200,
  height = 200,
  fallback,
  fallbackWidth = 80,
  fallbackHeight = 80,
}) {
  const defaultFallback = fallback || "/fallback.png";
  const [imgSrc, setImgSrc] = useState(src || defaultFallback);

  useEffect(() => {
    setImgSrc(src || defaultFallback);
  }, [src, defaultFallback]);

  const isFallback = imgSrc === defaultFallback;

  return (
    <Image
      src={imgSrc}
      alt={alt || "image"}
      width={isFallback ? fallbackWidth : width}
      height={isFallback ? fallbackHeight : height}
      onError={() => setImgSrc(defaultFallback)}
      unoptimized
    />
  );
}
