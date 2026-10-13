// components/ImageWithFallback.jsx (नई file बनाएं)
"use client";

import Image from "next/image";
import { useState } from "react";
import { PREFIX } from "@/lib/APIUrl";

const ImageWithFallback = ({ src, alt, ...props }) => {
    // Check if src is valid URL
    const isValidUrl = src && (src.startsWith('http://') || src.startsWith('https://'));
    const fallbackSrc = `${PREFIX}/noImage2.jpg`;

    const [imgSrc, setImgSrc] = useState(isValidUrl ? src : fallbackSrc);

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                setImgSrc(fallbackSrc);
            }}
        />
    );
};

export default ImageWithFallback;
